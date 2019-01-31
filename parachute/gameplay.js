cf.defineScene("gameplay", gameplay);

function gameplay() {
    // Shore

    var shoreL = cf.e('2D, Canvas, Color, Collision, Solid');

    shoreL
        .attr({x: 0, y: setup.height - (setup.tile * 2), w: setup.tile * 2, h: setup.tile * 2})
        .color('green')
        .collision();

    var shoreR = cf.e('2D, Canvas, Color, Collision, Solid');

    shoreR
        .attr({x: setup.width - (setup.tile * 3), y: setup.height - (setup.tile * 2), w: setup.tile * 3, h: setup.tile * 2})
        .color('green')
        .collision();

    var water = cf.e('2D, Canvas, Color, Collision, Water');

    water
        .attr({x: setup.tile * 2, y: setup.height - setup.tile, w: setup.tile * 5, h: setup.tile})
        .color('#00c4ff')
        .collision();

    // Boat

    var boat = cf.e('2D, Canvas, Color, Keyboard, Collision, Boat');

    boat
        .attr({x: shoreL.w, y: setup.height - (setup.tile * 2), w: setup.tile * 2, h: setup.tile, z:0})
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
        .textFont({size: '20px'})
        .bind('UpdateScore', function(){
            this.value++;
            this.text(this.value)
        });

    // Parachute

    var paths = [
        [0,2,1,1,0],
        [2,1,1,0,0],
        [0,1,0,0,0],
        [1,1,1,1,0]
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

        place: function(initialX, initialY) {
            this.x = initialX;
            this.y = initialY;

            // Return to allow chaining
            return this;
        },

        startMovement: function() {
            var timer = 0;

            this.bind("UpdateFrame", function(eventData) {
                timer += eventData.dt;

                if(timer >= 1000){
                    // Parachutes move at 1 tile/second
                    this.x -= setup.tile * this.path[this.counter];
                    this.y += setup.tile;

                    this.counter++;

                    // Collision between parachute and boat
                    if(this.hit('Boat') != null){
                        this.destroy();

                        // Update Score
                        score.trigger("UpdateScore");

                        // At each point, the probability of extra parachutes raises by 1%
                        helicopter.extraParachutesProbability += 0.01;
                    }
                    else if (this.y > setup.height){
                        console.log("perde vida");
                        this.destroy();
                    }

                    timer = 0;
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
            this.launchInterval = 3000,
            this.timer = 0,
            this.extraParachutesProbability = 0.5
        },

        generateLaunchLocation: function(){
            var launchX = setup.width - this.w - (cf.math.randomInt(1,2) * setup.tile);
            var launchY = cf.math.randomInt(0,1) * setup.tile;

            var coords = [launchX, launchY];

            return coords;
        },

        launchParachute: function(color){
            var loc = this.generateLaunchLocation();
            var newColor = color ? color : "gray";

            cf.e('Parachute')
                .place(loc[0], loc[1])
                .color(newColor)
                .startMovement();
        },

        launchExtraParachutes: function(){
            this.delay(function(){
                this.launchParachute('yellow');
            }, 800, 0);
        },

        startLaunch: function() {
            this.launchParachute('orange');

            this.bind('UpdateFrame', function(eventData){
                this.timer+= eventData.dt;

                if(this.timer >= this.launchInterval){
                    this.launchParachute('orange');
                    this.timer = 0;

                    // Roll the dice to check against extra parachutes probability
                    var extraLaunch = cf.math.randomNumber(0, 1);

                    if(extraLaunch >= this.extraParachutesProbability){
                        this.launchExtraParachutes();
                    }
                }
            });
            return this;
        }
    });

    var helicopter = cf.e("Helicopter");

    helicopter
        .color('blue')
        .startLaunch();
}
