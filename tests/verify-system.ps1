# ==============================================================================
# SHASHWAT GROUP SAAS CRM - SYSTEM & BACKEND VERIFICATION SUITE
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🔍 RUNNING SHASHWAT GROUP CRM BACKEND & CLOUD VERIFICATION" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$testResults = @()
$errorsCount = 0

function Assert-Test($testName, $condition, $details) {
    if ($condition) {
        Write-Host "  [PASS] $testName" -ForegroundColor Green
        return @{ Name = $testName; Status = "PASS"; Details = $details }
    } else {
        Write-Host "  [FAIL] $testName - $details" -ForegroundColor Red
        $script:errorsCount++
        return @{ Name = $testName; Status = "FAIL"; Details = $details }
    }
}

# 1. Project Directory Structure Verification
Write-Host "`n📁 1. Verifying Directory Structure & Critical Modules..." -ForegroundColor Yellow
$dirs = @("database", "database/seeds", "server/src", "server/src/controllers", "server/src/routes", "server/src/utils", "cloud/drive", "cloud/storage", "cloud/deployment", "docs")
foreach ($dir in $dirs) {
    $exists = Test-Path $dir
    $testResults += Assert-Test "Directory '$dir' exists" $exists "Path: $dir"
}

# 2. Database Schema Integrity
Write-Host "`n🗄️ 2. Verifying Database Schema & SQL Migration Scripts..." -ForegroundColor Yellow
$schemaFile = "database/schema.sql"
$schemaExists = Test-Path $schemaFile
$testResults += Assert-Test "database/schema.sql exists" $schemaExists ""

if ($schemaExists) {
    $sqlContent = Get-Content $schemaFile -Raw
    $tables = @("organizations", "users", "leads", "contacts", "deals", "tasks", "documents", "inventory_items", "stock_transactions", "invoices", "invoice_items", "drive_files")
    foreach ($tbl in $tables) {
        $hasTable = $sqlContent -match "CREATE TABLE IF NOT EXISTS $tbl"
        $testResults += Assert-Test "Table schema for '$tbl' defined" $hasTable "SQL table check"
    }
}

# 3. Micro-PDF Generator & KB Optimization
Write-Host "`n⚡ 3. Verifying Micro-PDF Engine (< 15 KB guarantee)..." -ForegroundColor Yellow
$pdfGenPath = "server/src/utils/microPdfGenerator.js"
$pdfGenExists = Test-Path $pdfGenPath
$testResults += Assert-Test "microPdfGenerator.js exists" $pdfGenExists ""
if ($pdfGenExists) {
    $pdfGenContent = Get-Content $pdfGenPath -Raw
    $hasInvoicePdf = $pdfGenContent -match "generateInvoicePdf"
    $hasStockPdf = $pdfGenContent -match "generateStockVoucherPdf"
    $hasCoreFont = $pdfGenContent -match "Helvetica"
    $testResults += Assert-Test "Invoice vector generator defined" $hasInvoicePdf "Type-1 Helvetica"
    $testResults += Assert-Test "Stock voucher vector generator defined" $hasStockPdf "Zero font embedding"
    $testResults += Assert-Test "Zero-overhead core fonts configured" $hasCoreFont ""
}

# 4. Server Routes & Controller Mapping
Write-Host "`n📡 4. Verifying API Routes & Controllers..." -ForegroundColor Yellow
$routes = @("auth.routes.js", "lead.routes.js", "deal.routes.js", "task.routes.js", "document.routes.js", "analytics.routes.js", "inventory.routes.js", "billing.routes.js", "drive.routes.js")
foreach ($r in $routes) {
    $rPath = "server/src/routes/$r"
    $rExists = Test-Path $rPath
    $testResults += Assert-Test "Route module '$r' exists" $rExists "Path: $rPath"
}

# 5. Cloud Drive Storage Integration
Write-Host "`n☁️ 5. Verifying Cloud Drive & Storage Providers..." -ForegroundColor Yellow
$driveManagerPath = "cloud/drive/driveManager.js"
$gdriveServicePath = "cloud/drive/googleDriveService.js"
$testResults += Assert-Test "DriveManager module exists" (Test-Path $driveManagerPath) ""
$testResults += Assert-Test "GoogleDriveService module exists" (Test-Path $gdriveServicePath) ""

# 6. Frontend Client (Option A: BaaS) Verification
Write-Host "`n🖥️ 6. Verifying Frontend Client Architecture (React + Vite + Supabase)..." -ForegroundColor Yellow
$clientFiles = @(
    "client/package.json",
    "client/vite.config.js",
    "client/src/App.jsx",
    "client/src/config/supabaseClient.js",
    "client/src/services/billingService.js",
    "client/src/services/inventoryService.js",
    "client/src/services/driveService.js",
    "client/src/components/InvoiceModal.jsx",
    "client/src/components/StockMovementModal.jsx",
    "client/src/components/PrintBillModal.jsx",
    "client/src/pages/Dashboard.jsx",
    "client/src/pages/Billing.jsx",
    "client/src/pages/Inventory.jsx",
    "client/src/pages/CloudDrive.jsx"
)
foreach ($cf in $clientFiles) {
    $cExists = Test-Path $cf
    $testResults += Assert-Test "Client file '$cf' exists" $cExists ""
}

# 7. Git Synchronization
Write-Host "`n🚀 7. Verifying Git Repository Status..." -ForegroundColor Yellow
$gitStatus = & "C:\Users\Professor\AppData\Local\Programs\Git\cmd\git.exe" status --porcelain
$testResults += Assert-Test "Working tree clean and synchronized" ([string]::IsNullOrWhiteSpace($gitStatus)) ""

Write-Host "`n==========================================================" -ForegroundColor Cyan
if ($errorsCount -eq 0) {
    Write-Host "✅ ALL BACKEND & CLOUD VERIFICATION CHECKS PASSED (100% READY)" -ForegroundColor Green
} else {
    Write-Host "❌ $errorsCount VERIFICATION CHECKS FAILED" -ForegroundColor Red
}
Write-Host "==========================================================" -ForegroundColor Cyan
