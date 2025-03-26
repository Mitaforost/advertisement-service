const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Op } = require('sequelize');
const { getStatistics } = require('./models');
const {
    User, Category, Ad, AdImage, Message, Favorite, AdView
} = require('./models'); // Sequelize models import

const app = express();
app.use(cors());  // Enable CORS for all routes
app.use(bodyParser.json());  // Parse JSON body data

// Test route
app.get('/', (req, res) => {
    res.send("API is working!");
});

// LOGIN ROUTE
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Validate the password (assuming passwords are stored securely with hashing, modify accordingly)
        if (user.password !== password) {  // Ideally, use a hashed comparison here
            return res.status(401).json({ error: "Invalid credentials" });
        }

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// USERS ROUTES
app.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        return res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/users', async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        return res.status(201).json({ message: "User created!" });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// REGISTER ROUTE
app.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Create a new user (Note: Make sure passwords are hashed before saving)
        const newUser = await User.create({
            username,
            password, // In a real app, hash the password here before saving
            email,
        });

        return res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// AD ROUTES
app.get('/ads', async (req, res) => {
    try {
        const ads = await Ad.findAll();
        return res.json(ads);
    } catch (error) {
        console.error('Error fetching ads:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/ads', async (req, res) => {
    try {
        const newAd = await Ad.create(req.body);
        return res.status(201).json(newAd);
    } catch (error) {
        console.error('Error creating ad:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.put('/ads/:id', async (req, res) => {
    try {
        const adId = req.params.id;
        const { user_id, title, description, category_id, price, location } = req.body;

        const ad = await Ad.findByPk(adId);
        if (!ad) {
            return res.status(404).json({ error: "Ad not found" });
        }

        await ad.update({ user_id, title, description, category_id, price, location });

        return res.status(200).json(ad);
    } catch (error) {
        console.error('Error updating ad:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete('/ads/:id', async (req, res) => {
    try {
        const adId = req.params.id;

        const ad = await Ad.findByPk(adId);
        if (!ad) {
            return res.status(404).json({ error: "Ad not found" });
        }

        await ad.destroy();
        return res.status(200).json({ message: "Ad successfully deleted" });
    } catch (error) {
        console.error('Error deleting ad:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// MESSAGES ROUTES
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.findAll();
        return res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/messages', async (req, res) => {
    try {
        const newMessage = await Message.create(req.body);
        return res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error creating message:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.put('/messages/:id', async (req, res) => {
    try {
        const messageId = req.params.id;
        const { sender_id, receiver_id, ad_id, content, is_read } = req.body;

        const message = await Message.findByPk(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        await message.update({ sender_id, receiver_id, ad_id, content, is_read });

        return res.status(200).json(message);
    } catch (error) {
        console.error('Error updating message:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete('/messages/:id', async (req, res) => {
    try {
        const messageId = req.params.id;

        const message = await Message.findByPk(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        await message.destroy();
        return res.status(200).json({ message: "Message successfully deleted" });
    } catch (error) {
        console.error('Error deleting message:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
app.get('/messages/inbox/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Message.findAll({ where: { receiver_id: userId } });
        return res.json(messages);
    } catch (error) {
        console.error('Error fetching inbox messages:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
app.get('/messages/sent/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Message.findAll({ where: { sender_id: userId } });
        return res.json(messages);
    } catch (error) {
        console.error('Error fetching sent messages:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// AD IMAGES ROUTES
app.get('/ad_images', async (req, res) => {
    try {
        const adImages = await AdImage.findAll();
        return res.json(adImages);
    } catch (error) {
        console.error('Error fetching ad images:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/ad_images', async (req, res) => {
    try {
        const newAdImage = await AdImage.create(req.body);
        return res.status(201).json(newAdImage);
    } catch (error) {
        console.error('Error creating ad image:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.put('/ad_images/:id', async (req, res) => {
    try {
        const adImageId = req.params.id;
        const { ad_id, image_url } = req.body;

        const adImage = await AdImage.findByPk(adImageId);
        if (!adImage) {
            return res.status(404).json({ error: "Ad image not found" });
        }

        await adImage.update({ ad_id, image_url });

        return res.status(200).json(adImage);
    } catch (error) {
        console.error('Error updating ad image:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete('/ad_images/:id', async (req, res) => {
    try {
        const adImageId = req.params.id;

        const adImage = await AdImage.findByPk(adImageId);
        if (!adImage) {
            return res.status(404).json({ error: "Ad image not found" });
        }

        await adImage.destroy();
        return res.status(200).json({ message: "Ad image successfully deleted" });
    } catch (error) {
        console.error('Error deleting ad image:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// FAVORITES ROUTES
app.get('/favorites', async (req, res) => {
    try {
        const favorites = await Favorite.findAll();
        return res.json(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/favorites', async (req, res) => {
    try {
        const newFavorite = await Favorite.create(req.body);
        return res.status(201).json(newFavorite);
    } catch (error) {
        console.error('Error creating favorite:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete('/favorites/:userId/:adId', async (req, res) => {
    try {
        const { userId, adId } = req.params;

        const favorite = await Favorite.findOne({ where: { user_id: userId, ad_id: adId } });
        if (!favorite) {
            return res.status(404).json({ error: "Favorite not found" });
        }

        await favorite.destroy();
        return res.status(200).json({ message: "Favorite successfully deleted" });
    } catch (error) {
        console.error('Error deleting favorite:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// AD VIEWS ROUTES
app.get('/ad_views', async (req, res) => {
    try {
        const adViews = await AdView.findAll();
        return res.json(adViews);
    } catch (error) {
        console.error('Error fetching ad views:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/ad_views', async (req, res) => {
    try {
        const newAdView = await AdView.create(req.body);
        return res.status(201).json(newAdView);
    } catch (error) {
        console.error('Error creating ad view:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete('/ad_views/:id', async (req, res) => {
    try {
        const adViewId = req.params.id;

        const adView = await AdView.findByPk(adViewId);
        if (!adView) {
            return res.status(404).json({ error: "Ad view not found" });
        }

        await adView.destroy();
        return res.status(200).json({ message: "Ad view successfully deleted" });
    } catch (error) {
        console.error('Error deleting ad view:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/statistics', async (req, res) => {
    try {
        // Fetch counts and sums
        const statistics = await getStatistics();

        // Respond with statistics data
        return res.status(200).json(statistics);
    } catch (error) {
        console.error('Error while fetching statistics:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
