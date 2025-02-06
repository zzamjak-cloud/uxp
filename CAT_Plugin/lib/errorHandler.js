// lib/errorHandler.js

const { showAlert } = require('./lib');

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
            userMessage += '적절한 권한이 있는지 확인하세요.';
            break;
        case 'layer_operation':
            userMessage += '레이어를 선택하세요.';
            break;
        case 'smart_object':
            userMessage += '스마트 오브젝트를 확인하세요.';
            break;
        case 'export':
            userMessage += '접근 가능한지 확인하세요.';
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