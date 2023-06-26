const express = require('express');
const path = require('path');
const fs = require('fs');
const uniqid = require('uniqid');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Serve the notes page
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/api /notes'));
});

// Retrieve all notes from the database
app.get('/api/notes', (req, res) => {
  // Read the contents of the database file
  fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
      const notes = JSON.parse(data);
      res.json(notes); // Send the notes as a JSON response
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

// Create a new note
app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;

  if (!title || !text) {
    return res.status(400).json({ error: 'Title and text are required' });
  }

  const newNote = {
    title,
    text,
    id: uniqid() // Generate a unique ID for the new note
  };

  // Read the contents of the database file
  fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
      const parsed = JSON.parse(data);
      parsed.push(newNote); // Add the new note to the existing notes

      // Write the updated notes back to the database file
      fs.writeFile(
        path.join(__dirname, 'db', 'db.json'),
        JSON.stringify(parsed),
        err => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
          console.log('File updated successfully');
          res.json('Note posted successfully');
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

// Delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  // Read the contents of the database file
  fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
      const parsedData = JSON.parse(data);
      const newData = parsedData.filter(element => element.id !== noteId); // Filter out the note to be deleted

      // Write the updated notes back to the database file
      fs.writeFile(
        path.join(__dirname, 'db', 'db.json'),
        JSON.stringify(newData),
        err => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
          console.log(`Successfully deleted ${noteId}`);
          res.sendStatus(204);
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
