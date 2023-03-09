class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // limit_fps_flag:      bool 
    // fps:                 int
    constructor(canvas, limit_fps_flag, fps) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.slide_idx = 0;
        this.limit_fps = limit_fps_flag;
        this.fps = fps;
        this.start_time = null;
        this.prev_time = null;
        //everything defined in constructor because drawSlide is redone every frame
        //slide0:
        this.dx = 10;
        this.dy = 10;
        this.diamond = [
            Vector3(100, 200, 1),
            Vector3(145, 190, 1),
            Vector3(175, 175, 1),
            Vector3(190, 145, 1),
            Vector3(200, 100, 1),
            Vector3(190, 55, 1),
            Vector3(200, 100, 1),
            Vector3(190, 55, 1),
            Vector3(175, 25, 1),
            Vector3(145, 10, 1),
            Vector3(100, 1, 1),
            Vector3(55, 10, 1),
            Vector3(25, 25, 1),
            Vector3(10, 55, 1),
            Vector3(1, 100, 1),
            Vector3(25, 175, 1),
            Vector3(55, 190, 1),
        ]
        // console.log(this.diamond[0]);
        this.teal = [0, 128, 128, 255];
        this.tealTranslate = new Matrix(3,3);
        mat3x3Translate(this.tealTranslate, 20, 20);
        
        //slide1:
        this.polygon = [ 
            Vector3(100, 50, 1),
            Vector3(50, 150, 1),
            Vector3(100, 250, 1),
            Vector3(200, 250, 1),
            Vector3(250, 150, 1),
            Vector3(200, 50, 1)
        ];
        this.red = [200, 0, 0, 255];
        this.redRotate = new Matrix(3,3);
        mat3x3Rotate(this.redRotate, 5, 5);
        this.redTranslate1 = new Matrix(3,3);
        this.redTranslate2 = new Matrix(3,3);
        this.redOrigin= new Matrix(3,3);
        mat3x3Translate(this.redTranslate1, -150, -150);
        mat3x3Translate(this.redTranslate2, 150, 150);
        this.redOrigin = Matrix.multiply([this.redTranslate2, this.redRotate]);
        // console.log(this.redOrigin);
        this.redOrigin = Matrix.multiply([this.redOrigin, this.redTranslate1]);

        this.orangePoly = [
            Vector3(400, 150, 1),
            Vector3(500, 300, 1),
            Vector3(400, 450, 1),
            Vector3(300, 300, 1)
        ];
        //add side-hitting ifs to a translate/rotate matrix translate 1 * rotate
        this.orange = [200,150,0,255];
        this.orangeRotate = new Matrix(3,3);
        mat3x3Rotate(this.orangeRotate, -15, 15);
        this.orangeTranslate1 = new Matrix(3,3);
        this.orangeTranslate2 = new Matrix(3,3);
        this.orangeOrigin= new Matrix(3,3);
        mat3x3Translate(this.orangeTranslate1, -400, -300);
        mat3x3Translate(this.orangeTranslate2, 400, 300);
        this.orangeOrigin = Matrix.multiply([this.orangeTranslate2, this.orangeRotate]);
        // console.log(this.redOrigin);
        this.orangeOrigin = Matrix.multiply([this.orangeOrigin, this.orangeTranslate1]);

        this.bluePoly = [
            Vector3(450, 400, 1),
            Vector3(400, 500, 1),
            Vector3(500, 600, 1),
            Vector3(600, 500, 1),
            Vector3(550, 400, 1),
        ];
        // add side-hitting ifs to a translate/rotate matrix translate 1 * rotate
        this.blue = [0,100,255,255];
        this.blueRotate = new Matrix(3,3);
        mat3x3Rotate(this.blueRotate, -10, 10);
        this.blueTranslate1 = new Matrix(3,3);
        this.blueTranslate2 = new Matrix(3,3);
        this.blueOrigin= new Matrix(3,3);
        mat3x3Translate(this.blueTranslate1, -500, -500);
        mat3x3Translate(this.blueTranslate2, 500, 500);
        this.blueOrigin = Matrix.multiply([this.blueTranslate2, this.blueRotate]);
        // console.log(this.redOrigin);
        this.blueOrigin = Matrix.multiply([this.blueOrigin, this.blueTranslate1]);
        
        //slide2
        this.slide2Poly = [
            Vector3(100, 50, 1),
            Vector3(50, 150, 1),
            Vector3(100, 250, 1),
            Vector3(200, 250, 1),
            Vector3(250, 150, 1),
            Vector3(200, 50, 1)
        ];

        this.slide2Poly2 = [
            Vector3(400, 350, 1),
            Vector3(350, 450, 1),
            Vector3(400, 550, 1),
            Vector3(500, 550, 1),
            Vector3(550, 450, 1),
            Vector3(500, 350, 1)
        ];

        // Polygon 1 stuff
        this.slide2OrgDec = new Matrix(3,3);
        this.slide2OrgInc = new Matrix(3,3);
        this.slide2ScalarDec = new Matrix(3,3);
        this.slide2ScalarInc = new Matrix(3,3);
        this.slide2Pos = new Matrix(3,3);
        this.slide2Neg = new Matrix(3,3);

        // Used for maximum/minimum growth
        this.ticker = 0;

        // attempt for rate control, failed, ignore
        this.tickerMemory = 0;

        // Origin Translate stuff
        mat3x3Translate(this.slide2Pos, 150, 150);
        mat3x3Translate(this.slide2Neg, -150, -150);

        // Decreasing stuff
        mat3x3Scale(this.slide2ScalarDec, 1.052, 1.052);

        this.slide2OrgDec = Matrix.multiply([this.slide2Pos, this.slide2ScalarDec]);
        this.slide2OrgDec = Matrix.multiply([this.slide2OrgDec, this.slide2Neg]);

        // Increasing stuff
        mat3x3Scale(this.slide2ScalarInc, 0.95, 0.95);

        this.slide2OrgInc = Matrix.multiply([this.slide2Pos, this.slide2ScalarInc]);
        this.slide2OrgInc = Matrix.multiply([this.slide2OrgInc, this.slide2Neg]);

        this.slide2OrgDec2 = new Matrix(3,3);
        this.slide2OrgInc2 = new Matrix(3,3);
        this.slide2ScalarDec2 = new Matrix(3,3);
        this.slide2ScalarInc2 = new Matrix(3,3);
        this.slide2Pos2 = new Matrix(3,3);
        this.slide2Neg2 = new Matrix(3,3);

        // Origin Translate stuff
        mat3x3Translate(this.slide2Pos2, 450, 450);
        mat3x3Translate(this.slide2Neg2, -450, -450);

        // Decreasing stuff
        mat3x3Scale(this.slide2ScalarDec2, .95, 1.05);

        this.slide2OrgDec2 = Matrix.multiply([this.slide2Pos2, this.slide2ScalarDec2]);
        this.slide2OrgDec2 = Matrix.multiply([this.slide2OrgDec2, this.slide2Neg2]);

        // Increasing stuff
        mat3x3Scale(this.slide2ScalarInc2, 1.052, 0.95);

        this.slide2OrgInc2 = Matrix.multiply([this.slide2Pos2, this.slide2ScalarInc2]);
        this.slide2OrgInc2 = Matrix.multiply([this.slide2OrgInc2, this.slide2Neg2]);
        // slide3:
        
        this.greenPoly = [
            Vector3(450, 400, 1),
            Vector3(400, 500, 1),
            Vector3(500, 600, 1),
            Vector3(600, 500, 1),
            Vector3(550, 400, 1),
        ];
        // add side-hitting ifs to a translate/rotate matrix translate 1 * rotate
        this.green = [0,0,255,255];
        this.greenRotate = new Matrix(3,3);
        mat3x3Rotate(this.greenRotate, -5, -5);
        this.greenTranslate1 = new Matrix(3,3);
        this.greenTranslate2 = new Matrix(3,3);
        this.greenOrigin= new Matrix(3,3);
        mat3x3Translate(this.greenTranslate1, -300, -300);
        mat3x3Translate(this.greenTranslate2, 300, 300);
        this.greenOrigin = Matrix.multiply([this.greenTranslate1, this.greenRotate]);
        this.greenOrigin = Matrix.multiply([this.greenOrigin, this.greenTranslate2]);

        
        this.greenPoly2 = [
            Vector3(100, 50, 1),
            Vector3(50, 150, 1),
            Vector3(100, 250, 1),
            Vector3(200, 250, 1),
            Vector3(250, 150, 1),
            Vector3(200, 50, 1),
        ];
        // add side-hitting ifs to a translate/rotate matrix translate 1 * rotate
        this.green2 = [0,255,255,255];
        this.greenRotate2 = new Matrix(3,3);
        mat3x3Rotate(this.greenRotate2, 5, 5);
        this.greenTranslate12 = new Matrix(3,3);
        this.greenTranslate22 = new Matrix(3,3);
        this.greenOrigin2= new Matrix(3,3);
        mat3x3Translate(this.greenTranslate12, -300, -300);
        mat3x3Translate(this.greenTranslate22, 300, 300);
        this.greenOrigin2 = Matrix.multiply([this.greenTranslate12, this.greenRotate2]);
        this.greenOrigin2 = Matrix.multiply([this.greenOrigin2, this.greenTranslate22]);


        this.center = [
            Vector3(100, 50, 1),
            Vector3(50, 150, 1),
            Vector3(100, 250, 1),
            Vector3(200, 250, 1),
            Vector3(250, 150, 1),
            Vector3(200, 50, 1)
            // Vector3(400, 350, 1),
            // Vector3(350, 450, 1),
            // Vector3(400, 550, 1),
            // Vector3(500, 550, 1),
            // Vector3(550, 450, 1),
            // Vector3(500, 350, 1)
        ];

        // Polygon 1 stuff
        this.centerOrgDec = new Matrix(3,3);
        this.center2OrgInc = new Matrix(3,3);
        this.centerScalarDec = new Matrix(3,3);
        this.centerScalarInc = new Matrix(3,3);
        this.centerPos = new Matrix(3,3);
        this.centerNeg = new Matrix(3,3);

        // Used for maximum/minimum growth
        this.ticker2 = 0;

        // attempt for rate control, failed, ignore
        this.tickerMemory2 = 0;

        // Origin Translate stuff
        mat3x3Translate(this.centerPos, 200, 200);
        mat3x3Translate(this.centerNeg, -200, -200);

        // Decreasing stuff
        mat3x3Scale(this.centerScalarDec, 1.052, 1.052);

        this.centerOrgDec = Matrix.multiply([this.centerPos, this.centerScalarDec]);
        this.centerOrgDec = Matrix.multiply([this.centerOrgDec, this.centerNeg]);

        // Increasing stuff
        mat3x3Scale(this.centerScalarInc, 0.95, 0.95);

        this.centerOrgInc = Matrix.multiply([this.centerPos, this.centerScalarInc]);
        this.centerOrgInc = Matrix.multiply([this.centerOrgInc, this.centerNeg]);

        
    }

    // flag:  bool
    limitFps(flag) {
        this.limit_fps = flag;
    }

    // n:  int
    setFps(n) {
        this.fps = n;
    }

    // idx: int
    setSlideIndex(idx) {
        this.slide_idx = idx;
    }

    animate(timestamp) {
        // Get time and delta time for animation
        if (this.start_time === null) {
            this.start_time = timestamp;
            this.prev_time = timestamp;
        }
        let time = timestamp - this.start_time;
        let delta_time = timestamp - this.prev_time;
        //console.log('animate(): t = ' + time.toFixed(1) + ', dt = ' + delta_time.toFixed(1));

        // Update transforms for animation
        this.updateTransforms(time, delta_time);

        // Draw slide
        this.drawSlide();

        // Invoke call for next frame in animation
        if (this.limit_fps) {
            setTimeout(() => {
                window.requestAnimationFrame((ts) => {
                    this.animate(ts);
                });
            }, Math.floor(1000.0 / this.fps));
        }
        else {
            window.requestAnimationFrame((ts) => {
                this.animate(ts);
            });
        }

        // Update previous time to current one for next calculation of delta time
        this.prev_time = timestamp;
    }

    //
    updateTransforms(time, delta_time) {
        // TODO: update any transformations needed for animation
        //change positions and all side-hitting ifs
        // console.log(this.diamond[1].values[0]);
        
        for (let i=-0; i< this.diamond.length; i++) {
            // console.log(this.diamond();
            if(this.diamond[i].values[0] >= this.canvas.width){
                //hits right edge
                mat3x3Translate(this.tealTranslate, -this.dx, -this.dy);
            }
            if(this.diamond[i].values[0] <= 0) {
                //hits left edge
                mat3x3Translate(this.tealTranslate, this.dx, this.dy);
            }
            if(this.diamond[i].values[1] <= 0) {
                //hits bottom
                mat3x3Translate(this.tealTranslate, this.dx, this.dy);
            }
            if(this.diamond[i].values[1] >= this.canvas.height){
                //hits top
                mat3x3Translate(this.tealTranslate, this.dx, -this.dy);
                
            }
            
        }

    }

    //
    drawSlide() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.slide_idx) {
            case 0:
                this.drawSlide0();
                break;
            case 1:
                this.drawSlide1();
                break;
            case 2:
                this.drawSlide2();
                break;
            case 3:
                this.drawSlide3();
                break;
        }
    }

    //
    drawSlide0() {
        // TODO: draw bouncing ball (circle that changes direction whenever it hits an edge)
        // TODO: draw the ball every dt
        //don't want to define anything at this  level, will be reset every frame

        // Following line is example of drawing a single polygon
        // (this should be removed/edited after you implement the slide)

        
        this.drawConvexPolygon(this.diamond, this.teal);
        for (let i = 0; i < this.diamond.length; i++){
            
            this.diamond[i] = Matrix.multiply([this.tealTranslate, this.diamond[i]]);
        }
        
    }

    //
    drawSlide1() {
        // TODO: draw at least 3 polygons that spin about their own centers
        //   - have each polygon spin at a different speed / direction
        this.drawConvexPolygon(this.polygon, this.red);
        this.drawConvexPolygon(this.orangePoly, this.orange)
        this.drawConvexPolygon(this.bluePoly, this.blue);
        for (let i = 0; i < this.polygon.length; i++){
            
            this.polygon[i] = Matrix.multiply([this.redOrigin, this.polygon[i]]);
            // this.polygon[i] = Matrix.multiply([this.redTranslate2, this.polygon[i]]);
        }

        for (let i = 0; i < this.orangePoly.length; i++){
            this.orangePoly[i] = Matrix.multiply([this.orangeOrigin, this.orangePoly[i]]);
            // this.polygon[i] = Matrix.multiply([this.redTranslate2, this.polygon[i]]);
        }
        
        for (let i = 0; i < this.bluePoly.length; i++){
            this.bluePoly[i] = Matrix.multiply([this.blueOrigin, this.bluePoly[i]]);
            // this.polygon[i] = Matrix.multiply([this.redTranslate2, this.polygon[i]]);
        }

    }

    //
    drawSlide2() {
        // TODO: draw at least 2 polygons grow and shrink about their own centers
        //   - have each polygon grow / shrink different sizes
        //   - try at least 1 polygon that grows / shrinks non-uniformly in the x and y directions

        // for (let i = 0; i < this.bluePoly.length; i++){
        //     this.bluePoly[i] = Matrix.multiply([this.blueOrigin, this.bluePoly[i]]);
        //     // this.polygon[i] = Matrix.multiply([this.redTranslate2, this.polygon[i]]);
        // }
        this.drawConvexPolygon(this.slide2Poly, [0,0,255,255]);
        this.drawConvexPolygon(this.slide2Poly2, this.red);
        
        for(let i = 0; i<this.slide2Poly.length; i++){
            if((0<= this.ticker) && (this.ticker <= 300)){
                this.slide2Poly[i] = Matrix.multiply([this.slide2OrgDec, this.slide2Poly[i]]);
                this.slide2Poly2[i] = Matrix.multiply([this.slide2OrgDec2, this.slide2Poly2[i]]);
                
            }else if((0<= this.ticker) && (this.ticker <= 600)){
                this.slide2Poly[i] = Matrix.multiply([this.slide2OrgInc, this.slide2Poly[i]]);
                this.slide2Poly2[i] = Matrix.multiply([this.slide2OrgInc2, this.slide2Poly2[i]]);

            }else{
                this.ticker = 0;
                i+=this.slide2Poly.length;
            }
            this.ticker+=1;
        }


    }

    //
    drawSlide3() {
        // TODO: get creative!
        //   - animation should involve all three basic transformation types
        //     (translation, scaling, and rotation)
        this.drawConvexPolygon(this.center, [0,0,255,255]);
        
        for(let i = 0; i<this.center.length; i++){
            if((0<= this.ticker2) && (this.ticker2 <= 300)){
                this.center[i] = Matrix.multiply([this.centerOrgDec, this.center[i]]);
                
            }else if((0<= this.ticker2) && (this.ticker2 <= 600)){
                this.center[i] = Matrix.multiply([this.centerOrgInc, this.center[i]]);

            }else{
                this.ticker2 = 0;
                i+=this.center.length;
            }
            this.ticker2+=1;
        }
        this.drawConvexPolygon(this.greenPoly, this.green);
        this.drawConvexPolygon(this.greenPoly2, this.green2);
        for (let i = 0; i < this.greenPoly.length; i++){
            this.greenPoly[i] = Matrix.multiply([this.greenOrigin, this.greenPoly[i]]);

        }
        for (let i = 0; i < this.greenPoly2.length; i++){
            this.greenPoly2[i] = Matrix.multiply([this.greenOrigin2, this.greenPoly2[i]]);
            
        }


    }

    // vertex_list:  array of object [Matrix(3, 1), Matrix(3, 1), ..., Matrix(3, 1)]
    // color:        array of int [R, G, B, A]
    drawConvexPolygon(vertex_list, color) {
        this.ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (color[3] / 255) + ')';
        this.ctx.beginPath();
        let x = vertex_list[0].values[0][0] / vertex_list[0].values[2][0];
        let y = vertex_list[0].values[1][0] / vertex_list[0].values[2][0];
        this.ctx.moveTo(x, y);
        for (let i = 1; i < vertex_list.length; i++) {
            x = vertex_list[i].values[0][0] / vertex_list[i].values[2][0];
            y = vertex_list[i].values[1][0] / vertex_list[i].values[2][0];
            this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
};
