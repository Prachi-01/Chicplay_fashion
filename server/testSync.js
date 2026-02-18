const googleSheetsService = require('./services/googleSheetsService');
const mongoose = require('mongoose');

// Mock a product object
const mockProduct = {
    _id: new mongoose.Types.ObjectId(),
    name: "Verification Test Dress",
    price: 999,
    category: "dresses",
    attributes: {
        color: "#FF69B4"
    },
    stock: 50,
    images: ["https://via.placeholder.com/400"],
    description: "This is a test product to verify real-time sync.",
    createdAt: new Date()
};

async function runTest() {
    console.log("🚀 Starting verification test for Google Sheets Sync...");
    try {
        await googleSheetsService.appendProductRow(mockProduct);
        console.log("✅ Test PASSED: Row appended successfully.");

        console.log("🔄 Testing update...");
        mockProduct.price = 1299;
        await googleSheetsService.updateProductRow(mockProduct);
        console.log("✅ Test PASSED: Row updated successfully.");

        console.log("🗑️ Testing delete...");
        await googleSheetsService.deleteProductRow(mockProduct._id);
        console.log("✅ Test PASSED: Row deleted successfully.");

        console.log("\n✨ ALL TESTS PASSED! Google Sheets Sync is fully functional.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Test FAILED:", error.message);
        process.exit(1);
    }
}

runTest();
