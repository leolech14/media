const { body, query, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Validation failed', 
            details: errors.array() 
        });
    }
    next();
};

// Validation rules for each endpoint
const validateGenerateScript = [
    body('prompt')
        .notEmpty().withMessage('Prompt is required')
        .isString().withMessage('Prompt must be a string')
        .isLength({ min: 10, max: 500 }).withMessage('Prompt must be between 10 and 500 characters')
        .trim()
        .escape(),
    handleValidationErrors
];

const validateGenerateAudio = [
    body('segments')
        .isArray().withMessage('Segments must be an array')
        .notEmpty().withMessage('Segments array cannot be empty'),
    body('segments.*.text')
        .notEmpty().withMessage('Segment text is required')
        .isString().withMessage('Segment text must be a string'),
    body('segments.*.duration')
        .optional()
        .isNumeric().withMessage('Segment duration must be a number'),
    body('voiceName')
        .optional()
        .isString().withMessage('Voice name must be a string')
        .isIn(['pt-BR-FranciscaNeural', 'pt-BR-AntonioNeural', 'pt-BR-Wavenet-A', 'pt-BR-Wavenet-B', 'pt-BR-Wavenet-C', 'pt-BR-Neural2-A', 'pt-BR-Neural2-B', 'pt-BR-Neural2-C'])
        .withMessage('Invalid voice name'),
    handleValidationErrors
];

const validateSearchMedia = [
    query('query')
        .notEmpty().withMessage('Search query is required')
        .isString().withMessage('Query must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('Query must be between 2 and 100 characters')
        .trim(),
    query('type')
        .optional()
        .isIn(['video', 'image', 'gif']).withMessage('Type must be video, image, or gif'),
    query('count')
        .optional()
        .isInt({ min: 1, max: 50 }).withMessage('Count must be between 1 and 50'),
    handleValidationErrors
];

const validateGenerateSubtitles = [
    body('segments')
        .isArray().withMessage('Segments must be an array')
        .notEmpty().withMessage('Segments array cannot be empty'),
    body('segments.*.text')
        .notEmpty().withMessage('Segment text is required')
        .isString().withMessage('Segment text must be a string'),
    body('segments.*.startTime')
        .isNumeric().withMessage('Start time must be a number')
        .custom(value => value >= 0).withMessage('Start time must be non-negative'),
    body('segments.*.endTime')
        .isNumeric().withMessage('End time must be a number')
        .custom((value, { req, path }) => {
            const index = parseInt(path.match(/\[(\d+)\]/)[1]);
            return value > req.body.segments[index].startTime;
        }).withMessage('End time must be greater than start time'),
    handleValidationErrors
];

module.exports = {
    validateGenerateScript,
    validateGenerateAudio,
    validateSearchMedia,
    validateGenerateSubtitles
};