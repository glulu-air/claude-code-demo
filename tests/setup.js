// テスト環境セットアップ
global.HTMLCanvasElement = class {
    constructor() {
        this.width = 800;
        this.height = 600;
    }
    
    getContext(type) {
        if (type === '2d') {
            return {
                fillStyle: '',
                fillRect: jest.fn(),
                beginPath: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                closePath: jest.fn(),
                fill: jest.fn(),
                clearRect: jest.fn()
            };
        }
        return null;
    }
};

// モック用HTMLElement
function createMockElement() {
    return {
        textContent: '',
        style: {
            display: 'none'
        }
    };
}

global.document = {
    getElementById: jest.fn((id) => {
        if (id === 'gameCanvas') {
            return new HTMLCanvasElement();
        }
        return createMockElement();
    }),
    addEventListener: jest.fn(),
    createElement: jest.fn(() => new HTMLCanvasElement())
};

global.window = {
    addEventListener: jest.fn(),
    requestAnimationFrame: jest.fn(),
    cancelAnimationFrame: jest.fn()
};

global.requestAnimationFrame = jest.fn();
global.cancelAnimationFrame = jest.fn();