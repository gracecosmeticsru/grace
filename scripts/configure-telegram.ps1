param([switch]$UseDialog)
$ErrorActionPreference = 'Stop'
$telegramPath = Join-Path (Split-Path -Parent $PSScriptRoot) '.dev.vars.telegram'
if (Test-Path -LiteralPath $telegramPath) { throw 'Telegram settings already exist; this helper will not overwrite them.' }
if ($UseDialog) {
  if ($PSVersionTable.PSEdition -ne 'Desktop') { throw 'Use Windows PowerShell for the credential dialog.' }
  # A newer parent shell can inherit a different PSModulePath; load the built-in module explicitly.
  Import-Module (Join-Path $PSHOME 'Modules/Microsoft.PowerShell.Security/Microsoft.PowerShell.Security.psd1') -ErrorAction Stop
  $telegramCredential = Get-Credential -UserName 'Telegram bot' -Message 'Paste the new Telegram bot token in Password. Keep the username unchanged. The token is saved only on this computer.'
  if ($null -eq $telegramCredential) { throw 'Cancelled; nothing was written.' }
  $telegramSecure = $telegramCredential.Password
} else {
  $telegramSecure = Read-Host 'Paste the new Telegram bot token (hidden)' -AsSecureString
}
$telegramToken = [System.Net.NetworkCredential]::new('', $telegramSecure).Password
try {
  if ($telegramToken -notmatch '^\d{5,15}:[A-Za-z0-9_-]{20,100}$') { throw 'The token format is invalid; nothing was written.' }
  [System.IO.File]::WriteAllText($telegramPath, "GRACE_TELEGRAM_BOT_TOKEN=$telegramToken`nGRACE_TELEGRAM_CHAT_ID=`n", [System.Text.UTF8Encoding]::new($false))
  Write-Output 'Telegram token saved locally. Group is unset; sending remains blocked.'
} finally {
  $telegramToken = $null
  $telegramSecure.Dispose()
  $telegramCredential = $null
}
