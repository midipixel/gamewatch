cf.defineScene("title", title);

function title(){
    var titleScene = cf.e("HTML");

    // Define titleScene's DOM
    var dom =
    `
        <main id="titleScene" class="titleScene">
            <h1>Paracute</h1>
            <button>Start</button>
        </main>
    `

    // Draw the DOM
    titleScene
        .attr({
            w: setup.width,
            h: setup.height,
            x: 0,
            y: 0
        })
        .append(dom);

    // Bind event listeners
    var startButton = document.querySelector("#titleScene button");
    startButton.addEventListener('click', function(){
        cf.enterScene('gameplay');
    })
}

cf.enterScene("title");
