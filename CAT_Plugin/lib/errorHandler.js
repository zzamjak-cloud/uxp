// lib/errorHandler.js

const { showAlert } = require('./lib');
const { ERROR_MESSAGES } = require('./constants');

class PhotoshopError extends Error {
    constructor(message, operation, details = '') {
        super(message);
        this.name = 'PhotoshopError';
        this.operation = operation;
        this.details = details;
    }
}

async function handleError(error, operation) {
    console.error(`${operation} `, error);
    
    let userMessage = '에러: ';
    
    switch (operation) {
        case 'file_operation':
            userMessage += ERROR_MESSAGES.NO_PERMISSION;
            break;
        case 'layer_operation':
            userMessage += ERROR_MESSAGES.NO_SELECTION_LAYERS;
            break;
        case 'smart_object':
            userMessage += ERROR_MESSAGES.NO_SMART_OBJECT;
            break;
        case 'export':
            userMessage += ERROR_MESSAGES.NO_PERMISSION;
            break;
        default:
            userMessage += `${operation} 실행중... 다시 시도하세요.`;
    }

    await showAlert(`${error}`);
    
    // Re-throw for upstream handling if needed
    throw new PhotoshopError(userMessage, operation, error.message);
}

module.exports = {
    handleError,
    PhotoshopError
};