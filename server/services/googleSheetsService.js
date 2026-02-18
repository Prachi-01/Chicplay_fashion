const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
require('dotenv').config();

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

// SCOPES for Google Sheets API
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Auth Setup
const auth = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * Maps a product object to a row array based on user requirements:
 * [product_id, name, price, category, color, stock, image_url, description, created_at]
 */
const mapProductToRow = (product) => {
    return [
        product._id.toString(),
        product.name || '',
        product.price || 0,
        product.category || '',
        product.attributes?.color || '',
        product.stock || 0,
        product.images?.[0] || '',
        product.description || '',
        product.createdAt ? new Date(product.createdAt).toISOString() : new Date().toISOString()
    ];
};

/**
 * Appends a new product row to the "ProductDatabase" sheet.
 */
exports.appendProductRow = async (product) => {
    try {
        if (!SPREADSHEET_ID) throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID missing');

        const row = mapProductToRow(product);
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'A:I',
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [row],
            },
        });
        console.log(`✅ Google Sync: Product ${product._id} added to sheet.`);
    } catch (error) {
        console.error('❌ Google Sync Error (Append):', error.message);
        throw error;
    }
};

/**
 * Updates an existing product row in the sheet.
 * Logic: Find the row by product_id (Column A) and update that range.
 */
exports.updateProductRow = async (product) => {
    try {
        if (!SPREADSHEET_ID) throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID missing');

        const productId = product._id.toString();

        // 1. Find the row
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'A:A',
        });

        const rows = response.data.values;
        if (!rows) return await exports.appendProductRow(product); // Fallback if sheet empty

        const rowIndex = rows.findIndex(r => r[0] === productId);

        if (rowIndex === -1) {
            console.log(`⚠️ Google Sync: Product ${productId} not found in sheet, appending instead.`);
            return await exports.appendProductRow(product);
        }

        // Rows in Google Sheets are 1-indexed
        const range = `A${rowIndex + 1}:I${rowIndex + 1}`;
        const row = mapProductToRow(product);

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
            valueInputOption: 'RAW',
            resource: {
                values: [row],
            },
        });
        console.log(`✅ Google Sync: Product ${productId} updated in sheet.`);
    } catch (error) {
        console.error('❌ Google Sync Error (Update):', error.message);
        throw error;
    }
};

/**
 * Deletes a product row from the sheet.
 * Logic: In v4, we use batchUpdate with deleteDimension to remove the whole row.
 */
exports.deleteProductRow = async (productId) => {
    try {
        if (!SPREADSHEET_ID) throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID missing');

        const idStr = productId.toString();

        // 1. Get IDs to find the row index
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'A:A',
        });

        const rows = response.data.values;
        if (!rows) return;

        const rowIndex = rows.findIndex(r => r[0] === idStr);
        if (rowIndex === -1) return;

        // 2. Delete the row
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: 0, // Assuming first sheet
                                dimension: 'ROWS',
                                startIndex: rowIndex,
                                endIndex: rowIndex + 1,
                            },
                        },
                    },
                ],
            },
        });
        console.log(`✅ Google Sync: Product ${idStr} deleted from sheet.`);
    } catch (error) {
        console.error('❌ Google Sync Error (Delete):', error.message);
        throw error;
    }
};
