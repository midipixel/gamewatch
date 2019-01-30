// Initialize Crafty and values

var setup = {
    cols: 4,
    tile: 48,
    width: 480,
    height: 288
}

var cf = Crafty;
cf.init(setup.width, setup.height, document.getElementById('game'));

// Shore

var shoreL = cf.e('2D, Canvas, Color, Collision, Solid');

shoreL
    .attr({x: 0, y: setup.height - setup.tile, w: setup.tile * 2, h: setup.tile})
    .color('green')
    .collision();

var shoreR = cf.e('2D, Canvas, Color, Collision, Solid');

shoreR
    .attr({x: setup.width - (setup.tile * 3), y: setup.height - setup.tile, w: setup.tile * 3, h: setup.tile})
    .color('green')
    .collision();

// Boat

var boat = cf.e('2D, Canvas, Color, Keyboard, Collision, Boat');

boat
    .attr({x: shoreL.w, y: setup.height - setup.tile, w: setup.tile * 2, h: setup.tile, z:0})
    .color('#999')
    .collision()
    .checkHits()
    .bind('KeyDown', function(e){
        if(e.key == cf.keys.RIGHT_ARROW){
			this.x += setup.tile;

            if(this.hit('Solid')){
                this.x -= setup.tile;
            }
        }
        else if(e.key == cf.keys.LEFT_ARROW){
            this.x -= setup.tile;

            if(this.hit('Solid')){
                this.x += setup.tile;
            }
        }
    });

// Score

var score = cf.e('2D, DOM, Text');

score
    .attr({ x: 0, y: 0, w: setup.tile * 1, value: 0})
    .text("0")
    .bind('UpdateScore', function(){
        this.value++;
        this.text(this.value)
    });

// Parachute

var paths = [
    [1,2,1,0,0],
    [2,1,1,0,0],
    [0,1,0,0,0]
]

cf.c("Parachute", {
    init: function() {
        this.addComponent("2D, Canvas, Color, Collision");
        this.x = 0;
        this.y = 0;
        this.w = setup.tile;
        this.h = setup.tile;
        this.counter = 0;
        this.collision();
        this.checkHits();
        this.path = paths[cf.math.randomInt(0, paths.length - 1)]
    },

    spawn: function(initialX, initialY) {
        this.x = initialX;
        this.y = initialY;

        //Draw
        this.color('orange');

        // Return to allow chaining
        return this;
    },

    startMovement: function() {
        this.bind("UpdateFrame", function(eventData) {
            if(eventData.frame % 50 == 0){
                // Parachutes move at 1 tile/second
                this.x -= setup.tile * this.path[this.counter];
                this.y += setup.tile;

                this.counter++;

                // Collision between parachute and boat
                if(this.hit('Boat') != null){
                    this.destroy();

                    // Update Score
                    score.trigger("UpdateScore");
                }
                else if (this.y > setup.height){
                    console.log("perde vida");
                    this.destroy();
                }
            }
        });

        // Return to allow chaining
        return this;
    },

    remove: function() {
        //Crafty.log('Parachute was removed!');
    },
})

// Helicopter

cf.c("Helicopter", {
    init: function() {
        this.addComponent("2D, Canvas, Color, Delay");
        this.w =  setup.tile * 2,
        this.h = setup.tile * 2,
        this.x = setup.width - (setup.tile * 2),
        this.launchInterval = 2000,
        this.timer = 0
    },

    remove: function() {

    },

    generateLaunchLocation: function(){
        var launchX = setup.width - this.w - (cf.math.randomInt(1,2) * setup.tile);
        var launchY = cf.math.randomInt(0,1) * setup.tile;

        var coords = [launchX, launchY];

        return coords;
    },

    launchParachute: function() {
        var chuteInterval = 300;



        //var launchX = this.w - (cf.math.randomInt(1,2) * setup.tile);
        //var launchY = cf.math.randomInt(0,1) * setup.tile;

        this.bind('UpdateFrame', function(eventData){
            this.timer+= eventData.dt;

            if(this.timer >= this.launchInterval){
                var loc = this.generateLaunchLocation();

                cf.e('Parachute')
                    .spawn(loc[0], loc[1])
                    .startMovement();

                /*this.delay(function(){
                    cf.e('Parachute').spawn().color('red');
                }, 800, 0);*/

                /*if (this.interval > this.minInterval) {
                    this.interval -=100;
                }*/

                this.timer = 0;
            }
        });
        return this;
    }
});

var helicopter = cf.e("Helicopter");

helicopter
    .color('blue')
    .launchParachute();




