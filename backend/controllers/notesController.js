const Note = require('../models/Note');

// Upload Note (Cloudinary handles file storage)
exports.uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file.' });
    }

    const { title, description, university, degree, semester, subject } = req.body;

    // Cloudinary metadata
    const fileUrl = req.file.path;                 // Cloudinary-hosted URL
    const fileName = req.file.originalname;        // Original file name
    const fileSize = req.file.size;                // Size in bytes

    const note = await Note.create({
      title,
      description,
      university,
      degree,
      semester,
      subject,
      fileName,
      fileUrl,
      fileSize,
      uploadedBy: req.user._id
    });

    await note.populate('uploadedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully.',
      note
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// Get all notes (with optional filters)
exports.getNotes = async (req, res) => {
  try {
    const { university, degree, semester, subject, search } = req.query;

    const filter = {};

    if (university) filter.university = new RegExp(university, 'i');
    if (degree) filter.degree = new RegExp(degree, 'i');
    if (semester) filter.semester = new RegExp(semester, 'i');
    if (subject) filter.subject = new RegExp(subject, 'i');

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') }
      ];
    }

    const notes = await Note.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notes.length,
      notes
    });

  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// Download Note (redirect to Cloudinary URL + increment download count)
exports.downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    note.downloads += 1;
    await note.save();

    return res.redirect(note.fileUrl);
  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server Error: ' + error.message });
    }
  }
};

// Fetch dropdown filter options for frontend
exports.getFilterOptions = async (req, res) => {
  try {
    const universities = await Note.distinct('university');
    const degrees = await Note.distinct('degree');
    const semesters = await Note.distinct('semester');
    const subjects = await Note.distinct('subject');

    res.json({
      success: true,
      filters: {
        universities,
        degrees,
        semesters,
        subjects
      }
    });

  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
