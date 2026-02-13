const Address = require('../models/mysql/Address');

exports.getAddresses = async (req, res) => {
    try {
        const addresses = await Address.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ message: 'Failed to fetch addresses' });
    }
};

exports.addAddress = async (req, res) => {
    try {
        console.log('Adding address for user:', req.user);
        console.log('Address data:', req.body);
        const { fullName, phoneNumber, addressLine, city, state, pincode, landmark, isDefault } = req.body;

        if (!fullName || !phoneNumber || !addressLine || !city || !state || !pincode) {
            console.log('Validation failed: Missing required fields');
            return res.status(400).json({ message: 'All fields are required' });
        }

        // If this is the first address or set as default, we might want to unset other defaults
        if (isDefault) {
            await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
        }

        const address = await Address.create({
            userId: req.user.id,
            fullName,
            phoneNumber,
            addressLine,
            city,
            state,
            pincode,
            landmark,
            isDefault: isDefault || false
        });

        res.status(201).json(address);
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'Failed to add address: ' + error.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        await Address.destroy({ where: { id, userId: req.user.id } });
        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Failed to delete address' });
    }
};
