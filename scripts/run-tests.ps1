# Roda os testes do plugin a partir do core clonado (default ..\venore-docks):
#   .\scripts\run-tests.ps1                 testes unitários (motor, render, schema)
#   .\scripts\run-tests.ps1 -Integration    fluxo completo contra Postgres EM MEMÓRIA (PGlite) — nenhum
#                                           banco real é tocado
# Cria um junction node_modules -> core (o plugin não tem node_modules próprio) e o remove no fim.
param([string]$Core = "", [switch]$Integration, [string]$Filter = "")
$ErrorActionPreference = "Stop"
$plugin = Split-Path -Parent $PSScriptRoot
if (-not $Core) { $Core = Join-Path (Split-Path -Parent $plugin) "venore-docks" }
$Core = (Resolve-Path $Core).Path

Push-Location $Core
try {
  if ($Integration) {
    # --no-save: instala @electric-sql/pglite no core SEM gravar em package.json/lock.
    npm install --no-save --no-audit --no-fund --loglevel=error @electric-sql/pglite
  }
  $junction = Join-Path $plugin "node_modules"
  if (Test-Path $junction) { throw "$junction já existe — remova antes (é só um junction temporário)." }
  New-Item -ItemType Junction -Path $junction -Target (Join-Path $Core "node_modules") | Out-Null
  try {
    $env:CORE_DIR = $Core
    $config = if ($Integration) { "tests\integration\vitest.integration.config.ts" } else { "tests\vitest.unit.config.ts" }
    $args = @("vitest", "run", "--config", (Join-Path $plugin $config))
    if ($Filter) { $args += $Filter }
    & npx @args
  } finally {
    (Get-Item $junction).Delete()
  }
} finally {
  Pop-Location
}
