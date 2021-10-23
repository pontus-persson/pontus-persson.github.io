var AI = function(w, h) {

    this.canvasSize = new vec2(w, h);

    // random center spot
    this.center = new vec2(w * Math.random(), h * Math.random());
    this.vel = new vec2(0, 0);

    // Maximum weight
    this.maximumWeight = 100;

    // AI values
    this.distWeight = 0;    // Weight of "food", how much to value stearing to food
    this.edistWeight = 0;   // Weight of enemies, how much to value stearing away from enemies
    this.distCutoff = 0;    // How long can we see food
    this.edistCutoff = 0;   // How long can we see enemies
    this.turnlimit = 0;     // How much to limit turning in relation to stimulus
    this.maxspeed = 0;      // Max speed of entity

    this.maximumValues = {
        distWeight: 1,
        edistWeight: 1,
        distCutoff: 500,
        edistCutoff: 500,
        turnlimit: 0.1,
        maxspeed: 6,
    }

    this.minimumValues = {
        distWeight: 0,
        edistWeight: 0,
        distCutoff: 40,
        edistCutoff: 40,
        turnlimit: 0.0,
        maxspeed: 0.4,
    }

    
    // console.log("New AI: distW:"+this.distWeight+ " distC:"+this.distCutoff+" limit:"+this.turnlimit+" maxspeed:"+this.maxspeed);

    
    this.setValues = function(parent) {
        
        let values = [
            Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()
        ];
        let sum = values.reduce(function(a, b) { return a + b; }, 0);

        for (let i = 0; i < values.length; i++) {
            values[i] = values[i] / sum; // set values to a percentage according to its random value
        }
        let sum2 = values.reduce(function(a, b) { return a + b; }, 0);
        
        if(Math.round(sum2) !== 1) {
            throw("Error in setValues, values sum not equal to 1");
        }
        
        if (!parent) {
            this.distWeight = (values[0] * (this.maximumValues.distWeight - this.minimumValues.distWeight)) + this.minimumValues.distWeight;
            this.edistWeight = (values[1] * (this.maximumValues.edistWeight - this.minimumValues.edistWeight)) + this.minimumValues.edistWeight;
            this.distCutoff = (values[2] * (this.maximumValues.distCutoff - this.minimumValues.distCutoff)) + this.minimumValues.distCutoff;
            this.edistCutoff = (values[3] * (this.maximumValues.edistCutoff - this.minimumValues.edistCutoff)) + this.minimumValues.edistCutoff;
            this.turnlimit = (values[4] * (this.maximumValues.turnlimit - this.minimumValues.turnlimit)) + this.minimumValues.turnlimit;
            this.maxspeed = (values[5] * (this.maximumValues.maxspeed - this.minimumValues.maxspeed)) + this.minimumValues.maxspeed;
            // this.distWeight = Math.random();
            // this.edistWeight = Math.random();
            // this.distCutoff = 50 + 300 * Math.random() * Math.random();
            // this.edistCutoff = 50 + 300 * Math.random() * Math.random();
            // this.turnlimit = Math.random();
            // this.maxspeed = 6 * Math.random();
        }
        
    }
    this.setValues();


    this.update = function(entity, targets, enemies) {
        this.vel.x = 0;
        this.vel.y = 0;
        
        for (var i = 0; i < enemies.length; i++) {
            var edelta = new vec2(enemies[i].pos.x - entity.pos.x, enemies[i].pos.y - entity.pos.y);
            var edist = edelta.len();
            if(edist < 12) {
                entity.score--;
                enemies.splice(i, 1);
                continue;
            }

            if(edist > this.edistCutoff) {
                continue;
            }
            var eweight = this.edistCutoff / edist * this.edistWeight;

            edelta.normalize();

            this.vel.x -= edelta.x * eweight;
            this.vel.y -= edelta.y * eweight;
        }

        for (var i = 0; i < targets.length; i++) {
            var delta = new vec2(targets[i].pos.x - entity.pos.x, targets[i].pos.y - entity.pos.y);
            var dist = delta.len();
            if(dist < 12) {
                entity.score++;
                targets.splice(i, 1);
                continue;
            }
            if(dist > this.distCutoff) {
                continue;
            }

            var weight = this.distCutoff / dist * this.distWeight;

            delta.normalize();

            this.vel.x += delta.x * weight;
            this.vel.y += delta.y * weight;
        }

        // fallback if no targets found, move to center
        var delta = 0;
        var dist = 0;
        if(this.vel.x == 0 && this.vel.y == 0) {
            delta = new vec2(this.center.x - entity.pos.x, this.center.y - entity.pos.y);
            dist = delta.len();
            this.vel.x += delta.x * this.distWeight;
            this.vel.y += delta.y * this.distWeight;
        }
        // set random new point if reached or just randomly
        if(dist < 30 || Math.random() < 0.01) {
            this.center.x = this.canvasSize.x * Math.random();
            this.center.y = this.canvasSize.y * Math.random();
        }

        this.vel.limit(this.turnlimit);
        entity.vel.limit(this.maxspeed);
    }
}