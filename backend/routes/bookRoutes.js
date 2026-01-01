const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

/**
 * @route   POST /api/books
 * @desc    Add a new book to the database
 * @access  Public
 * @returns {Object} Success message and book object
 */
router.post('/', async (req, res) => {
  // Extract book details from request body
  const { title, author, isbn, publicationYear } = req.body;
  
  try {
    // Validate required fields
    if (!title || !author || !isbn || !publicationYear) {
      return res.status(400).json({ 
        msg: 'Please provide all required fields: title, author, ISBN, and publication year' 
      });
    }

    // Check if a book with the same ISBN already exists in the database
    // ISBN should be unique to prevent duplicate entries
    let book = await Book.findOne({ isbn });
    if (book) {
      return res.status(400).json({ 
        msg: 'A book with this ISBN already exists in the library' 
      });
    }

    // Create new book instance with provided data
    book = new Book({
      title,
      author,
      isbn,
      publicationYear
    });

    // Save the book to the database
    await book.save();
    
    // Return success response with the created book
    res.status(201).json({ 
      msg: 'Book added successfully', 
      book 
    });
  } catch (err) {
    // Log error details for debugging
    console.error('Error adding book:', err.message);
    
    // Handle validation errors from MongoDB
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        msg: 'Invalid book data provided. Please check all fields.' 
      });
    }
    
    // Handle duplicate key errors (in case ISBN uniqueness is enforced at DB level)
    if (err.code === 11000) {
      return res.status(400).json({ 
        msg: 'A book with this ISBN already exists in the library' 
      });
    }
    
    // Generic server error response
    res.status(500).json({ 
      msg: 'Failed to add book. Please try again later.' 
    });
  }
});

/**
 * @route   GET /api/books
 * @desc    Retrieve all books from the database
 * @access  Public
 * @returns {Array} Array of all books in the library
 */
router.get('/', async (req, res) => {
  try {
    // Fetch all books from database and sort by creation date (newest first)
    // This ensures the most recently added books appear at the top
    const books = await Book.find().sort({ createdAt: -1 });
    
    // Return the books array
    res.json(books);
  } catch (err) {
    // Log error details for debugging
    console.error('Error fetching books:', err.message);
    
    // Return user-friendly error message
    res.status(500).json({ 
      msg: 'Failed to retrieve books. Please try again later.' 
    });
  }
});

/**
 * @route   DELETE /api/books/:id
 * @desc    Delete a book by its ID
 * @access  Public
 * @param   {String} id - MongoDB ObjectId of the book to delete
 * @returns {Object} Success message
 */
router.delete('/:id', async (req, res) => {
  try {
    // First, verify that the book exists in the database
    const book = await Book.findById(req.params.id);
    
    // If book doesn't exist, return 404 error
    if (!book) {
      return res.status(404).json({ 
        msg: 'Book not found. It may have already been deleted.' 
      });
    }

    // Delete the book from the database
    await Book.findByIdAndDelete(req.params.id);
    
    // Return success message
    res.json({ 
      msg: 'Book deleted successfully' 
    });
  } catch (err) {
    // Log error details for debugging
    console.error('Error deleting book:', err.message);
    
    // Handle invalid ObjectId format
    if (err.kind === 'ObjectId' || err.name === 'CastError') {
      return res.status(404).json({ 
        msg: 'Invalid book ID provided' 
      });
    }
    
    // Generic server error response
    res.status(500).json({ 
      msg: 'Failed to delete book. Please try again later.' 
    });
  }
});

module.exports = router;
