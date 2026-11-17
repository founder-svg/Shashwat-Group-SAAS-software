# 100% Free Google Drive Integration Setup Guide

Google accounts come with **15 GB of 100% Free Lifetime Cloud Storage**.
By connecting Google Drive via a free Service Account, Shashwat Group CRM can automatically store and organize:
- Every generated customer **Invoice PDF**
- Every **Stock In (Purchase)** voucher and bill
- Every **Stock Out (Dispatch)** delivery challan
- Inventory audit logs and spreadsheets

---

## Step-by-Step Setup (Takes 3 to 5 Minutes)

### 1. Create a Free Project in Google Cloud Console
1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/) (Sign in with your regular Google account).
2. Click **Select a project** -> **New Project**.
3. Name it: `Shashwat-Group-CRM` and click **Create**.

### 2. Enable Google Drive API
1. In the search bar at the top, type `Google Drive API`.
2. Click on **Google Drive API** and click the blue **ENABLE** button.

### 3. Create a Service Account (Zero Cost, No Credit Card)
1. Go to **APIs & Services** -> **Credentials**.
2. Click **+ CREATE CREDENTIALS** at the top -> select **Service account**.
3. Service account name: `shashwat-crm-storage`.
4. Click **Create and Continue**, then click **Done**.

### 4. Generate JSON Key
1. Under **Service Accounts**, click on your newly created service account email (e.g. `shashwat-crm-storage@...iam.gserviceaccount.com`).
2. Go to the **Keys** tab -> click **ADD KEY** -> **Create new key**.
3. Select **JSON** and click **Create**.
4. A `.json` file will download to your computer.

### 5. Create a Google Drive Folder & Share with Service Account
1. Open your regular [Google Drive](https://drive.google.com).
2. Create a folder named: `Shashwat-CRM`.
3. Right-click the folder -> click **Share**.
4. In the "Add people" box, paste the service account email (from the JSON file or step 3) and grant **Editor** access.
5. In the browser URL bar of that folder, copy the ID at the end (e.g., `https://drive.google.com/drive/folders/1a2b3c4d5e...`). That is your `GOOGLE_DRIVE_ROOT_FOLDER_ID`.

### 6. Add to `.env`
Open `.env` in the root of your project:
```env
GOOGLE_DRIVE_CLIENT_EMAIL="shashwat-crm-storage@your-project.iam.gserviceaccount.com"
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBA...-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_ROOT_FOLDER_ID="1a2b3c4d5e..."
```

---

## What Happens When Configured?
- Invoices are automatically uploaded to: `Shashwat-CRM/Invoices/`
- Stock In receipts are stored in: `Shashwat-CRM/Stock-In-Vouchers/`
- Stock Out slips are stored in: `Shashwat-CRM/Stock-Out-Dispatches/`
- Direct Google Drive links (`webViewLink`) are attached to records so any of the 5 team members can view or print them in 1 click!
