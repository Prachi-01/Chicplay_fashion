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
        const { fullName, email, phoneNumber, addressLine, city, state, pincode, landmark, isDefault } = req.body;

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
            email,
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

exports.updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, phoneNumber, addressLine, city, state, pincode, landmark, isDefault } = req.body;

        const address = await Address.findOne({ where: { id, userId: req.user.id } });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        if (isDefault) {
            await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
        }

        await address.update({
            fullName: fullName || address.fullName,
            email: email || address.email,
            phoneNumber: phoneNumber || address.phoneNumber,
            addressLine: addressLine || address.addressLine,
            city: city || address.city,
            state: state || address.state,
            pincode: pincode || address.pincode,
            landmark: landmark !== undefined ? landmark : address.landmark,
            isDefault: isDefault !== undefined ? isDefault : address.isDefault
        });

        res.json(address);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Failed to update address' });
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
