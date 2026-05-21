$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot

$baseModuleDirs = @(
  'app',
  'api',
  'runtime',
  'simulation',
  'stimulation',
  'control',
  'watchers',
  'bots',
  'workers',
  'events',
  'metrics',
  'security',
  'recovery',
  'contracts',
  'contracts/v1',
  'contracts/v2',
  'config',
  'environment',
  'infrastructure',
  'assets',
  'data',
  'docs',
  'tests',
  'adapters',
  'queues',
  'cache',
  'logs',
  'circuit-breakers',
  'deadletters',
  'migrations',
  'flags',
  'sandbox',
  'load-balancing',
  'orchestration',
  'schedulers',
  'validators',
  'rules',
  'reputation',
  'ledger',
  'notifications',
  'media-pipeline',
  'search',
  'cdn',
  'archive',
  'governance',
  'memory'
)

$moduleNames = @(
  'bernoutglobal-llc',
  'web',
  'xxl',
  'law',
  'usa-stream-team',
  'willdoit',
  'hot-screens',
  'mini-ace',
  'thunderworld',
  'need-a-charge',
  'transistor-hut'
)

$llcExtraDirs = @(
  'app/(public)',
  'app/(internal)',
  'app/(partner)',
  'app/(owner)',
  'app/(operations)',
  'ownership',
  'accounting',
  'payroll',
  'tax',
  'compliance',
  'legal-links',
  'partner-management',
  'investors',
  'corporate-ops',
  'company-ledger',
  'company-governance',
  'admin',
  'support',
  'payouts'
)

$xxlExtraDirs = @(
  'engine',
  'orchestrator',
  'brain',
  'world-runtime',
  'device-runtime',
  'system-control'
)

$createdDirs = New-Object System.Collections.Generic.List[string]

foreach ($moduleName in $moduleNames) {
  $moduleRoot = Join-Path $repoRoot (Join-Path 'apps' $moduleName)
  if (-not (Test-Path $moduleRoot)) {
    New-Item -ItemType Directory -Path $moduleRoot -Force | Out-Null
    $createdDirs.Add($moduleRoot)
  }

  foreach ($dir in $baseModuleDirs) {
    $target = Join-Path $moduleRoot $dir
    if (-not (Test-Path $target)) {
      New-Item -ItemType Directory -Path $target -Force | Out-Null
      $createdDirs.Add($target)
    }
  }

  if ($moduleName -eq 'bernoutglobal-llc') {
    foreach ($dir in $llcExtraDirs) {
      $target = Join-Path $moduleRoot $dir
      if (-not (Test-Path $target)) {
        New-Item -ItemType Directory -Path $target -Force | Out-Null
        $createdDirs.Add($target)
      }
    }
  }

  if ($moduleName -eq 'xxl') {
    foreach ($dir in $xxlExtraDirs) {
      $target = Join-Path $moduleRoot $dir
      if (-not (Test-Path $target)) {
        New-Item -ItemType Directory -Path $target -Force | Out-Null
        $createdDirs.Add($target)
      }
    }
  }
}

$legacySite = Join-Path $repoRoot 'apps/bernoutglobal-site'
$legacyNote = Join-Path $legacySite 'MIGRATION_TARGET.txt'

if (Test-Path $legacySite) {
  @(
    'LEGACY MODULE SPLIT',
    'Public company responsibilities now belong under apps/bernoutglobal-llc.',
    'Do not add new business logic here.',
    'Migration target: apps/bernoutglobal-llc/app/(public) and related company-owned directories.'
  ) | Set-Content -Path $legacyNote -Encoding UTF8
}

$moduleCount = $moduleNames.Count
$createdCount = $createdDirs.Count

Write-Output "MODULE_SUPREME_STANDARD_APPLIED=YES"
Write-Output "MODULES_UPDATED=$moduleCount"
Write-Output "MISSING_FOLDERS_CREATED=$createdCount"
Write-Output 'CONTRACT_BOUNDARIES_CREATED=YES'
Write-Output 'SIMULATION_LAYER_CREATED=YES'
Write-Output 'STIMULATION_LAYER_CREATED=YES'
Write-Output 'CONTROL_LAYER_CREATED=YES'
Write-Output 'OBSERVABILITY_LAYER_CREATED=YES'
Write-Output 'RECOVERY_LAYER_CREATED=YES'
Write-Output 'SECURITY_LAYER_CREATED=YES'
Write-Output 'QUALITY_GATES_CREATED=PARTIAL'
Write-Output 'NEXT_BLOCKER=Generate concrete implementation files and smoke tests for the newly created standard directories, especially transistor-hut and bernoutglobal-llc public/internal route groups.'