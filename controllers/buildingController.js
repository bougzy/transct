const Building = require('../models/Building');

exports.getAllBuildings = async (req, res) => {
  try {
    const buildings = await Building.find();
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching buildings' });
  }
};

exports.getBuildingById = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }
    res.json(building);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching building' });
  }
};

exports.createBuilding = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      investmentPrice,
      returnOnInvestment,
      numberOfRooms,
      numberOfBathrooms,
    } = req.body;

    const building = new Building({
      name,
      description,
      location,
      investmentPrice,
      returnOnInvestment,
      numberOfRooms,
      numberOfBathrooms,
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });

    await building.save();
    res.status(201).json({ message: 'Building created successfully', building });
  } catch (error) {
    res.status(500).json({ message: 'Error creating building' });
  }
};

exports.updateBuilding = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      investmentPrice,
      returnOnInvestment,
      numberOfRooms,
      numberOfBathrooms,
    } = req.body;

    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    building.name = name || building.name;
    building.description = description || building.description;
    building.location = location || building.location;
    building.investmentPrice = investmentPrice || building.investmentPrice;
    building.returnOnInvestment = returnOnInvestment || building.returnOnInvestment;
    building.numberOfRooms = numberOfRooms || building.numberOfRooms;
    building.numberOfBathrooms = numberOfBathrooms || building.numberOfBathrooms;

    if (req.file) {
      building.image = `/uploads/${req.file.filename}`;
    }

    await building.save();
    res.json({ message: 'Building updated successfully', building });
  } catch (error) {
    res.status(500).json({ message: 'Error updating building' });
  }
};

exports.deleteBuilding = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    await building.deleteOne();
    res.json({ message: 'Building deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting building' });
  }
};