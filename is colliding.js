function(){let distX = Math.abs(ball.x - this.x-this.rWidth/2);
let distY = Math.abs(ball.y - this.y-this.rHeight/2);

if(distX >(this.rWidth/2 + ball.size)){return false;}
if(distY >(this.rHeight/2 + ball.size)){return false;}

if(distX <= (this.rWidth/2)){return true;}
if(distY <= (this.rHeight/2)){return true;}

let dx = distX-this.rWidth/2;
let dy = distY-this.rHeight/2;
return((dx*dx)+dy*dy<=(ball.size*ball.size));

}