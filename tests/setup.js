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

global.document = {
    getElementById: jest.fn(() => ({
        textContent: '',
        style: { display: '' }
    })),
    addEventListener: jest.fn(),
    createElement: jest.fn(() => new HTMLCanvasElement())
};

global.window = {
    addEventListener: jest.fn(),
    requestAnimationFrame: jest.fn()
};

global.requestAnimationFrame = jest.fn();