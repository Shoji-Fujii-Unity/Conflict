# Headless Edge CDP probe for STRATA (ASCII only)
$ErrorActionPreference='Stop'
$edge="${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
if(-not (Test-Path $edge)){ $edge="${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe" }
$ud="$env:TEMP\st_cdp_udata"
$port=9345
$here=Split-Path -Parent $MyInvocation.MyCommand.Path
$shotPlay=Join-Path $here 'shot_play.png'
$shotMob=Join-Path $here 'shot_mobile.png'
$html=Resolve-Path (Join-Path $here '..\index.html')
$url="file:///" + $html.Path.Replace('\','/')
Remove-Item $shotPlay,$shotMob -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $ud -ErrorAction SilentlyContinue

$bp=Start-Process -FilePath $edge -ArgumentList @('--headless=new',"--remote-debugging-port=$port","--user-data-dir=$ud",'--disable-gpu','--disable-dev-shm-usage','--remote-allow-origins=*','--mute-audio','--window-size=1280,720',$url) -PassThru
Start-Sleep -Seconds 2
$target=$null
for($i=0;$i -lt 40;$i++){
  try{
    $list=Invoke-RestMethod "http://127.0.0.1:$port/json/list"
    $page=$list | Where-Object { $_.type -eq 'page' -and $_.url -like 'file://*' -and $_.webSocketDebuggerUrl } | Select-Object -First 1
    if($page){ $target=$page; break }
  }catch{}
  Start-Sleep -Milliseconds 500
}
if(-not $target){ Write-Host 'FAIL: no CDP page target'; Stop-Process -Id $bp.Id -Force -ErrorAction SilentlyContinue; exit 1 }

$ws=[System.Net.WebSockets.ClientWebSocket]::new()
$ws.ConnectAsync([Uri]$target.webSocketDebuggerUrl,[Threading.CancellationToken]::None).Wait()
$script:msgId=0
$script:pending=$null
$script:acc=''
$script:results=@{}
$script:errs=@()

function Send-Msg($method,$params){
  $o=[ordered]@{id=(++$script:msgId);method=$method}
  if($null -ne $params){ $o.params=$params }
  $json=$o | ConvertTo-Json -Compress -Depth 8
  $bytes=[Text.Encoding]::UTF8.GetBytes($json)
  $ws.SendAsync([ArraySegment[byte]]::new($bytes),[System.Net.WebSockets.WebSocketMessageType]::Text,$true,[Threading.CancellationToken]::None).Wait()
  return $script:msgId
}
function Handle-Event($obj){
  if($null -eq $obj){ return }
  if($obj.method -eq 'Runtime.exceptionThrown'){
    $d=$obj.params.exceptionDetails
    $desc=''
    if($d.exception){ $desc=$d.exception.description }
    $script:errs += ('EXC: ' + $d.text + ' | ' + $desc + ' | line:' + $d.lineNumber)
  } elseif($obj.method -eq 'Runtime.consoleAPICalled' -and ($obj.params.type -eq 'error')){
    $a=($obj.params.args | ForEach-Object { if($_.description){$_.description}else{$_.value} }) -join ' '
    $script:errs += ('CONSOLE.error: ' + $a)
  } elseif($obj.method -eq 'Log.entryAdded' -and $obj.params.entry.level -eq 'error'){
    $script:errs += ('LOG: ' + $obj.params.entry.text + ' | ' + $obj.params.entry.url)
  }
  if($obj.id){ $script:results[[int]$obj.id]=$obj }
  if($obj.error){ $script:errs += ('CDPERR id='+$obj.id+' '+$obj.error.message) }
}
function Pump($ms){
  $deadline=(Get-Date).AddMilliseconds($ms)
  while($true){
    $rem=[int]($deadline-(Get-Date)).TotalMilliseconds
    if($rem -le 0){ return }
    if($null -eq $script:pending){
      $buf=New-Object byte[] 262144
      $script:pending=@{task=$ws.ReceiveAsync([ArraySegment[byte]]::new($buf),[Threading.CancellationToken]::None);buf=$buf}
    }
    if($script:pending.task.Wait($rem)){
      $res=$script:pending.task.Result
      $script:acc += [Text.Encoding]::UTF8.GetString($script:pending.buf,0,$res.Count)
      if($res.EndOfMessage){
        $txt=$script:acc; $script:acc=''
        $obj=$null
        try{ $obj=$txt | ConvertFrom-Json }catch{}
        Handle-Event $obj
        $script:pending=$null
      } else {
        $buf2=New-Object byte[] 262144
        $script:pending=@{task=$ws.ReceiveAsync([ArraySegment[byte]]::new($buf2),[Threading.CancellationToken]::None);buf=$buf2}
      }
    } else { return }
  }
}
function Eval($expr){
  $id=Send-Msg 'Runtime.evaluate' ([ordered]@{expression=$expr;returnByValue=$true})
  $deadline=(Get-Date).AddSeconds(10)
  while(-not $script:results.ContainsKey($id) -and (Get-Date) -lt $deadline){ Pump 300 }
  if(-not $script:results.ContainsKey($id)){ return '<timeout>' }
  $r=$script:results[$id]
  if($r.result -and $r.result.exceptionDetails){ return 'EVAL_EXC: ' + $r.result.exceptionDetails.exception.description }
  if($r.result -and $r.result.result){ return $r.result.result.value }
  return '<noval>'
}
function Shot($path){
  $id=Send-Msg 'Page.captureScreenshot' ([ordered]@{format='png'})
  $deadline=(Get-Date).AddSeconds(10)
  while(-not $script:results.ContainsKey($id) -and (Get-Date) -lt $deadline){ Pump 300 }
  $r=$script:results[$id]
  if($r -and $r.result -and $r.result.data){ [IO.File]::WriteAllBytes($path,[Convert]::FromBase64String($r.result.data)); Write-Host ('shot: '+$path) }
  else { Write-Host 'SHOT FAIL' }
}

Send-Msg 'Runtime.enable' $null | Out-Null
Send-Msg 'Log.enable' $null | Out-Null
Send-Msg 'Page.enable' $null | Out-Null
Pump 1500

Write-Host ('boot errors so far: ' + $script:errs.Count)
Write-Host ('has __test: ' + (Eval '!!window.__test'))
Write-Host ('title shown: ' + (Eval "document.getElementById('scrTitle').classList.contains('show')"))
Write-Host ('click start: ' + (Eval "document.getElementById('btnStart').click(); 'ok'"))
Pump 700
Write-Host ('stage cards: ' + (Eval "document.querySelectorAll('#stages .stagecard').length"))
Write-Host ('click stage1: ' + (Eval "var bs=document.querySelectorAll('#stages .stagecard'); bs[0].click(); 'ok'"))
Pump 3000
Write-Host ('canvas nonzero px: ' + (Eval "(()=>{const c=document.getElementById('cv');const g=c.getContext('2d');const d=g.getImageData(0,0,c.width,c.height).data;let nz=0;for(let i=0;i<d.length;i+=388){if(d[i]+d[i+1]+d[i+2]>30)nz++;}return nz+'/'+Math.floor(d.length/388);})()"))
Write-Host ('gstate: ' + (Eval "(()=>{const g=window.__test.getG();if(!g)return 'noG';const tc=g.buildings.find(b=>b.team===0&&b.type==='tc');return JSON.stringify({vw:g.vw,vh:g.vh,zoom:g.zoom,cam:{x:Math.round(g.cam.x),y:Math.round(g.cam.y)},W:g.W,H:g.H,tc:{x:Math.round(tc.x),y:Math.round(tc.y)},nb:g.buildings.length,nu:g.units.length,paused:g.paused,t:Math.round(g.time)})})()"))
Write-Host ('wheel zoom: ' + (Eval "(()=>{const g=window.__test.getG();const z0=+g.zoom.toFixed(3);window.dispatchEvent(new WheelEvent('wheel',{deltaY:-120,clientX:400,clientY:300,bubbles:true,cancelable:true}));return JSON.stringify({z0:z0,z1:+g.zoom.toFixed(3),camok:(Number.isFinite(g.cam.x)&&Number.isFinite(g.cam.y))});})()"))
Write-Host ('screens: ' + (Eval "[...document.querySelectorAll('.screen')].map(s=>s.id+':'+s.classList.contains('show')).join(',')"))
Shot $shotPlay
# mobile landscape viewport
Send-Msg 'Emulation.setDeviceMetricsOverride' ([ordered]@{width=844;height=390;deviceScaleFactor=2;mobile=$true}) | Out-Null
Pump 1500
Write-Host ('tc onscreen (mobile): ' + (Eval "(()=>{const g=window.__test.getG();const tc=g.buildings.find(b=>b.team===0&&b.type==='tc');return JSON.stringify({sx:Math.round(tc.x-g.cam.x),sy:Math.round(tc.y-g.cam.y),vw:g.vw,vh:g.vh,cam:{x:Math.round(g.cam.x),y:Math.round(g.cam.y)},mm:{x:Math.round(g.mm.x),y:Math.round(g.mm.y),w:Math.round(g.mm.w),h:Math.round(g.mm.h)}})})()"))
Shot $shotMob
Write-Host ('final canvas: ' + (Eval "(()=>{const c=document.getElementById('cv');const g=c.getContext('2d');const d=g.getImageData(0,0,c.width,c.height).data;let nz=0;for(let i=0;i<d.length;i+=388){if(d[i]+d[i+1]+d[i+2]>30)nz++;}return nz;})()"))
Write-Host '--- errors ---'
$script:errs | Select-Object -First 20 | ForEach-Object { Write-Host $_ }
Write-Host ('total errors: ' + $script:errs.Count)
Stop-Process -Id $bp.Id -Force -ErrorAction SilentlyContinue
