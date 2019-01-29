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
    [2,2,1,0,0],
    [2,1,1,0,0],
    [1,2,1,0,0]
]

cf.c("Parachute", {
    init: function() {
        this.addComponent("2D, Canvas, Color, Collision");
        this.x = setup.width - (setup.tile * 3);
        this.y = 0;
        this.w = setup.tile;
        this.h = setup.tile;
        this.counter = 0;
        this.collision();
        this.checkHits();
        this.path = paths[cf.math.randomInt(0, paths.length - 1)]
    },

    remove: function() {
        //Crafty.log('Parachute was removed!');
    },

    spawn: function() {
        // Draw
        this.color('orange');

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

        // There's no magic to method chaining.
        // To allow it, we have to return the entity!
        return this;
    }
})

var helicopter = cf.e("2D, Canvas, Color");

helicopter
    .attr({
        w: setup.tile * 2,
        h: setup.tile * 1,
        x: setup.width - (setup.tile * 2),
        interval: 3000,
        minInterval: 800,
        timer: 0
    })
    .color('blue')
    .bind('UpdateFrame', function(eventData){
        this.timer+= eventData.dt;

        if(this.timer >= this.interval){
            //cf.e('Parachute').spawn();

            if (this.interval > this.minInterval) {
                this.interval -=100;
            }

            this.timer = 0;

        }
    });




