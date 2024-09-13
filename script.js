require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' } });

require(['vs/editor/editor.main'], function() {
    let currentMode = 'js';
    let currentFile = 'js';
    let currentTheme = 'vs-dark';
    let currentLanguage = 'javascript';
    const container = document.getElementById('container');
    const editorContainer = document.getElementById('editor-container');
    const output = document.getElementById('output');
    const splitGutter = document.getElementById('split-gutter');
    const modeSwitch = document.getElementById('mode-switch');
    const themeSelector = document.getElementById('theme-selector');
    const languageToggle = document.getElementById('language-toggle');
    const fileExplorer = document.getElementById('file-explorer');
    const resizeOverlay = document.getElementById('resize-overlay');
    const tabsContainer = document.getElementById('tabs');

    const files = {
        html: '<!DOCTYPE html>\n<html>\n<head>\n  <title>CodePen-like Editor</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  background-color: #f0f0f0;\n}\n\nh1 {\n  color: #333;\n}',
        js: '// Write your JavaScript or TypeScript code here\nconsole.log("Hello, world!");'
    };

    const openTabs = new Set(['js']);

    const editor = monaco.editor.create(document.getElementById('editor'), {
        value: files.js,
        language: currentLanguage,
        theme: currentTheme,
        automaticLayout: true
    });

    const themeColors = {
        'vs': { bg: '#ffffff', color: '#000000' },
        'vs-dark': { bg: '#1e1e1e', color: '#d4d4d4' },
        'hc-black': { bg: '#000000', color: '#ffffff' },
        'hc-light': { bg: '#ffffff', color: '#000000' },
        'github': { bg: '#ffffff', color: '#24292e' },
        'monokai': { bg: '#272822', color: '#f8f8f2' },
        'solarized-dark': { bg: '#002b36', color: '#839496' },
        'solarized-light': { bg: '#fdf6e3', color: '#657b83' },
        'abyss': { bg: '#000c18', color: '#6688cc' },
        'kimbie-dark': { bg: '#221a0f', color: '#d3af86' },
        'dracula': { bg: '#282a36', color: '#f8f8f2' },
        'nord': { bg: '#2e3440', color: '#d8dee9' },
        'tomorrow-night-blue': { bg: '#002451', color: '#ffffff' },
        'red': { bg: '#390000', color: '#ff9da4' },
        'synthwave-84': { bg: '#241b2f', color: '#ff7edb' }
    };

    // Define custom themes
    monaco.editor.defineTheme('abyss', {
        base: 'vs-dark',
        inherit: true,
        rules: [{ background: '000c18' }],
        colors: { 'editor.background': '#000c18' }
    });

    monaco.editor.defineTheme('kimbie-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [{ background: '221a0f' }],
        colors: { 'editor.background': '#221a0f' }
    });

    monaco.editor.defineTheme('dracula', {
        base: 'vs-dark',
        inherit: true,
        rules: [{ background: '282a36' }],
        colors: { 'editor.background': '#282a36' }
    });

    monaco.editor.defineTheme('nord', {
        base: 'vs-dark',
        inherit: true,
        rules: [{ background: '2e3440' }],
        colors: { 'editor.background': '#2e3440' }
    });

    monaco.editor.defineTheme('tomorrow-night-blue', {
        base: 'vs-dark',
        inherit: true,
        rules: [{ background: '002451' }],
        colors: { 'editor.background': '#002451' }
    });

    monaco.editor.defineTheme('red', {
        base: 'vs-dark',
        inherit: true,
        rules: [{ background: '390000' }],
        colors: { 'editor.background': '#390000' }
    });

    monaco.editor.defineTheme('synthwave-84', {
        base: 'vs-dark',
        inherit: true,
        rules: [{ background: '241b2f' }],
        colors: { 'editor.background': '#241b2f' }
    });

    function updateOutput() {
        if (currentMode === 'js') {
            output.innerHTML = '';
            const console_output = document.createElement('pre');
            output.appendChild(console_output);

            const originalConsole = { ...console };
            console.log = function(...args) {
                const line = document.createElement('p');
                line.className = 'output-line log';
                line.textContent = args.join(' ');
                console_output.appendChild(line);
                originalConsole.log.apply(console, args);
            };
            console.error = function(...args) {
                const line = document.createElement('p');
                line.className = 'output-line error';
                line.textContent = args.join(' ');
                console_output.appendChild(line);
                originalConsole.error.apply(console, args);
            };

            try {
                if (currentLanguage === 'typescript') {
                    // For TypeScript, we need to transpile the code before running it
                    const jsCode = ts.transpile(editor.getValue());
                    eval(jsCode);
                } else {
                    eval(editor.getValue());
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            const iframe = document.createElement('iframe');
            output.innerHTML = '';
            output.appendChild(iframe);

            const content = `
                ${files.html}
                <style>${files.css}</style>
                <script>${files.js}<\/script>
            `;

            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(content);
            iframe.contentWindow.document.close();
        }
    }

    function updateTheme(theme) {
        monaco.editor.setTheme(theme);
        currentTheme = theme;
        const colors = themeColors[theme] || themeColors['vs-dark'];
        output.style.backgroundColor = colors.bg;
        output.style.color = colors.color;
        document.body.style.backgroundColor = colors.bg;
        document.body.style.color = colors.color;
        fileExplorer.style.backgroundColor = colors.bg;
        fileExplorer.style.color = colors.color;
        splitGutter.style.backgroundColor = colors.color;
        modeSwitch.style.backgroundColor = colors.color;
        modeSwitch.style.color = colors.bg;
        themeSelector.style.backgroundColor = colors.color;
        themeSelector.style.color = colors.bg;
        languageToggle.style.backgroundColor = colors.color;
        languageToggle.style.color = colors.bg;
        tabsContainer.style.backgroundColor = colors.bg;
        document.querySelectorAll('.tab').forEach(tab => {
            tab.style.backgroundColor = tab.classList.contains('active') ? colors.bg : '#2d2d2d';
            tab.style.color = colors.color;
        });
    }

    function createTab(file) {
        const tab = document.createElement('div');
        tab.className = `tab ${file === currentFile ? 'active' : ''}`;
        tab.setAttribute('data-file', file);
        tab.innerHTML = `
            ${file.toUpperCase()}
            <span class="tab-close">×</span>
        `;
        tab.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tab-close')) {
                switchToFile(file);
            }
        });
        tab.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(file);
        });
        tabsContainer.appendChild(tab);
        openTabs.add(file);
    }

    function switchToFile(file) {
        if (!openTabs.has(file)) {
            createTab(file);
        }
        currentFile = file;
        editor.setValue(files[file]);
        monaco.editor.setModelLanguage(editor.getModel(), file === 'js' ? currentLanguage : file);
        updateActiveTabs();
    }

    function closeTab(file) {
        if (openTabs.size > 1) {
            openTabs.delete(file);
            tabsContainer.querySelector(`[data-file="${file}"]`).remove();
            if (currentFile === file) {
                switchToFile([...openTabs][0]);
            }
        }
    }

    function updateActiveTabs() {
        document.querySelectorAll('.tab').forEach(tab => {
            if (tab.getAttribute('data-file') === currentFile) {
                tab.classList.add('active');
                tab.style.backgroundColor = themeColors[currentTheme].bg;
            } else {
                tab.classList.remove('active');
                tab.style.backgroundColor = '#2d2d2d';
            }
        });
    }

    editor.onDidChangeModelContent(updateOutput);
    updateOutput();

    modeSwitch.addEventListener('click', () => {
        currentMode = currentMode === 'js' ? 'codepen' : 'js';
        modeSwitch.textContent = currentMode === 'js' ? 'Switch to CodePen Mode' : 'Switch to JS Mode';
        fileExplorer.style.display = currentMode === 'js' ? 'none' : 'block';
        languageToggle.style.display = currentMode === 'js' ? 'block' : 'none';
        updateOutput();
        editor.layout();
        updateTheme(currentTheme);
    });

    themeSelector.addEventListener('change', (e) => {
        updateTheme(e.target.value);
    });

    languageToggle.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'javascript' ? 'typescript' : 'javascript';
        languageToggle.textContent = `Switch to ${currentLanguage === 'javascript' ? 'TypeScript' : 'JavaScript'}`;
        monaco.editor.setModelLanguage(editor.getModel(), currentLanguage);
        updateOutput();
    });

    fileExplorer.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const file = e.target.getAttribute('data-file');
            switchToFile(file);
        }
    });

    // Improved smooth split pane functionality
    let isResizing = false;
    let lastUpdateTime = 0;
    const updateInterval = 16; // ~60fps

    function initResize(e) {
        isResizing = true;
        splitGutter.classList.add('active');
        resizeOverlay.style.display = 'block';
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }

    function resize(e) {
        if (!isResizing) return;

        const currentTime = Date.now();
        if (currentTime - lastUpdateTime < updateInterval) return;

        lastUpdateTime = currentTime;

        const containerRect = container.getBoundingClientRect();
        const newEditorWidth = e.clientX - containerRect.left;
        const newOutputWidth = containerRect.width - newEditorWidth - splitGutter.offsetWidth;

        if (newEditorWidth > 100 && newOutputWidth > 100) {
            editorContainer.style.width = `${newEditorWidth}px`;
            output.style.width = `${newOutputWidth}px`;
            requestAnimationFrame(() => editor.layout());
        }
    }

    function stopResize() {
        isResizing = false;
        splitGutter.classList.remove('active');
        resizeOverlay.style.display = 'none';
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }

    splitGutter.addEventListener('mousedown', initResize);

    editor.onDidChangeModelContent((e) => {
        files[currentFile] = editor.getValue();
        updateOutput();
    });

    // File explorer visibility
    let timeout;
    document.addEventListener('mousemove', (e) => {
        clearTimeout(timeout);
        if (e.clientX <= 5) {
            fileExplorer.classList.add('visible');
        } else {
            timeout = setTimeout(() => {
                fileExplorer.classList.remove('visible');
            }, 300);
        }
    });

    fileExplorer.addEventListener('mouseenter', () => {
        clearTimeout(timeout);
    });

    fileExplorer.addEventListener('mouseleave', () => {
        timeout = setTimeout(() => {
            fileExplorer.classList.remove('visible');
        }, 300);
    });

    // Initial layout and theme
    editor.layout();
    updateTheme(currentTheme);

    // Set initial file content
    files.html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodePen-like Editor</title>
    </head>
    <body>
        <h1>Hello, World!</h1>
        <p>Edit the HTML, CSS, and JavaScript/TypeScript to see live changes!</p>
    </body>
    </html>`;

    files.css = `body {
        font-family: Arial, sans-serif;
        background-color: #f0f0f0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
    }

    h1 {
        color: #333;
    }

    p {
        color: #666;
    }`;

    files.js = `// Write your JavaScript or TypeScript code here
    console.log("Hello, world!");

    // Example: Change the text color after 2 seconds
    setTimeout(() => {
        document.querySelector('h1').style.color = 'blue';
        console.log("Text color changed!");
    }, 2000);`;

    // Set initial editor content
    editor.setValue(files[currentFile]);
    monaco.editor.setModelLanguage(editor.getModel(), currentLanguage);

    // Create initial tab
    createTab('js');

    // Initial output update
    updateOutput();

    // Load TypeScript
    require(['vs/language/typescript/tsWorker'], function() {
        console.log('TypeScript support loaded');
    });
});