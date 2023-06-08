window.onload = function () {
	
	//Variables globales----------------------------------------------------------------------------
	let mode = "accueil";
	let version = "classique";

	let mouseX = 0; //Coordonnées de la souris en jeu
	let mouseY = 0;

	let width = 960; //Dimensions du canvas
	let height = 640;

	let freq = 33; //33ms pour avoir ~30fps
	let chronoID = 0; //Pour le chronomètre

	let pi2 = 2*Math.PI //raccourci

	let canvas = document.getElementById("canvasJeu");
	let ctx = canvas.getContext("2d");

	let diffMod = 3; //Jauge de difficulté (sur 5) => Celui est l'écran d'accueil est le 3
	let nbBlue = 0; //nb de bulles bleues

	let gameSize = 0;
	let gameBubbles = []; //Nombre de bulles en jeu + liste des bulles

	let demoSize = 20; //Tableau de bulles destinés aux écrans hors jeu
	let demoBubbles = [];
    for (let i = 0; i < demoSize; i++) {
    	demoBubbles.push(newBubble());
    }

    let hp = 3; //vies
	let tps = 0; //chronomètre
	let lvl = 1 //niveau
	let score = 0;

	//Fonctions bulles------------------------------------------------------------------------------
	function newBubble() { //Crée une bulle avec taille/vitesse/position aléatoires
		let bubble = {
			radius: Math.ceil(Math.random() * 2) * 15, //Rayons possibles : 15 / 30 px
			velocity: (2+Math.ceil(Math.random() * 2)) * 5 * diffMod, //Vitesses possibles : 45 / 60 px/s
			x: Math.floor(Math.random() * (width+1)),
			y: Math.floor(Math.random() * (-160) * diffMod) - 40,
			color: Math.floor(Math.random() * 5),
		}

		if (bubble.color < 2) { //2 bulles sur ~5 sont "gentilles" 
			bubble.color = "blue";
			nbBlue++;
		}
		else
			bubble.color = "red";

		return bubble;
	}

	function newBubbleInfinite(v) { //Crée une bulle avec taille/vitesse/position aléatoires
		let bubble = {
			radius: 22, //Dans ce mode, les bulles ont la même taille (choix perso pour varier un peu)
			velocity: 15 * v, 	//Si on est en mode infini, la vitesse n'est pas aléatoire pour que toutes les bulles accélèrent uniformément à chaque changement de niveau.
			x: Math.floor(Math.random() * (width+1)),
			y: Math.floor(Math.random() * (-800)),
			color: Math.floor(Math.random() * 5),
		}

		if (bubble.color < 2) { //2 bulles sur ~5 sont "gentilles" 
			bubble.color = "blue";
			nbBlue++;
		}
		else
			bubble.color = "red";

		return bubble;
	}

	function drawBubble(bubble) {
		ctx.fillStyle = bubble.color;
		ctx.strokeStyle = "white";
		ctx.beginPath();
		ctx.arc(bubble.x, bubble.y, bubble.radius, 0, pi2);
		ctx.fill();
		ctx.stroke();
	}

	//Fonctions jeu---------------------------------------------------------

	//Niveau du mode infini-------
	function initLvlInfinite() { //Initialise la liste avec 20 premiières bulles
		lvl = 1;
		score = 0;
		hp = 5;
		gameBubbles = [];
		gameSize = 20;
		for (let i = 0; i < gameSize; i++) {
    		gameBubbles.push(newBubbleInfinite(lvl));
    	}
	}

	//Niveau supérieur pour mode infini-------
	function lvlUpInfinite() { //Augmente la vitesse de toutes les bulles
		lvl++;
    	for (let i = 0; i < gameBubbles.length; i++) {
    		gameBubbles[i].velocity = 15 * lvl;
    	}
	}

	//Niveau 1------
	function initLvl1() { //Même principe, on charge la liste de bulles avec le bon nombre selon le niveau
		lvl = 1;
		hp = 3;
		score = 0;
		diffMod = 1;
		gameBubbles = [];
		gameSize = 5;
		nbBlue = 0;
		for (let i = 0; i < gameSize; i++) {
    		gameBubbles.push(newBubble());
    	}
	}

	//Niveau 2------
	function initLvl2() {
		diffMod = 2;
		gameBubbles = [];
		gameSize = 10;
		nbBlue = 0;
		for (let i = 0; i < gameSize; i++) {
    		gameBubbles.push(newBubble());
    	}
	}

	//Niveau 3------
	function initLvl3() {
		diffMod = 3;
		gameBubbles = [];
		gameSize = 15;
		nbBlue = 0;
		for (let i = 0; i < gameSize; i++) {
    		gameBubbles.push(newBubble());
    	}
	}

	//Niveau 4------
	function initLvl4() {
		diffMod = 4;
		gameBubbles = [];
		gameSize = 20;
		nbBlue = 0;
		for (let i = 0; i < gameSize; i++) {
    		gameBubbles.push(newBubble());
    	}
	}

	//Niveau 5------
	function initLvl5() {
		diffMod = 5;
		gameBubbles = [];
		gameSize = 25;
		nbBlue = 0;
		for (let i = 0; i < gameSize; i++) {
    		gameBubbles.push(newBubble());
    	}
	}

	//Bilan----------------------------------------------------------------------------------------
	function end(goto) {  //On reprend la liste de bulles de démo (celles de l'accueil) et on les réinitialise, ainsi que d'autres paramètres
		for (let i = 0; i < demoBubbles.length; i++) {
			bubble = demoBubbles[i];
			bubble.y = Math.floor(Math.random() * (-160) * diffMod) - 40;
			bubble.x = Math.floor(Math.random() * (width+1));
		}
		diffMod = 3;
		canvas.removeEventListener("mousemove", setMousePos); //Ne pas oublier de charger les bons listener selon l'écran courant

		if (goto == "accueil")
			canvas.addEventListener("click", clickJouer);
		else if (goto == "bilan")
			canvas.addEventListener("click", clickRejouer);

		clearInterval(chronoID);
		tps = 0;
		mode = goto;
	}

	//Fonction de collision-------------------------------------------------------------------------
	function collideTest() {
		let index = -1;

		for (let i = 0; i < gameBubbles.length; i++) {
			bubble = gameBubbles[i];
			if ((mouseX >= bubble.x - bubble.radius && mouseX <= bubble.x + bubble.radius) && (mouseY >= bubble.y - bubble.radius && mouseY <= bubble.y + bubble.radius)) {
				
				index = i;

				if (bubble.color == "blue") {
					score++;
					nbBlue--;
				}
				else if (bubble.color == "red") {
					hp--;
				}
			}
		}

		if (index != -1) {
			gameBubbles.splice(index, 1);

			if (version == "infini") {
				gameBubbles.push(newBubbleInfinite(lvl));
				gameSize++;
			}

			index = -1;
		}
	}

	//Fonctions refresh-----------------------------------------------------------------------------

	function refreshAccueilBilan() {
		let bubble;
		ctx.clearRect(0, 0, width, height); //A chaque rafraichissement, on efface le canvas et on redessine les bulles + les textes

		for (let i = 0; i < demoBubbles.length; i++) {
			bubble = demoBubbles[i];
			bubble.y += (freq*bubble.velocity)/1000; //qté de déplacement à chaque tick = vitesse * frequence de rafraichissement / 1000 (car c'est des ms)
			if (bubble.y - bubble.radius > height) {
				bubble.y = Math.floor(Math.random() * -30) - 40; //Si on dépasse, retour en haut
				bubble.x = Math.floor(Math.random() * (width+1));
			}
			drawBubble(bubble);
		}

		if (mode == "accueil") {
			//Titre
			ctx.fillStyle = "black";
			ctx.font = "64px Arial";
	        ctx.fillText("Bubble Hunt", 300, 330);

	        //Bouton jouer
	        ctx.fillStyle = "gray";
	        ctx.font = "28px Arial";
	        ctx.fillRect(270, 400, 125, 50);
	        ctx.fillRect(460, 400, 270, 50);
	        ctx.fillStyle = "black";
	        ctx.fillText("JOUER", 285, 435);

	        //Choix du mode de jeu
	        if (version == "classique")
	        	ctx.fillText("MODE CLASSIQUE", 470, 435); //Choix du mode
	    	if (version == "infini")
	    		ctx.fillText("MODE INFINI", 505, 435); //Choix du mode
		}

		if (mode == "bilan") {
			ctx.fillStyle = "black";
			ctx.font = "64px Arial";
	        ctx.fillText("Merci d'avoir joué !", 225, 330);
	        
	        if (hp <= 0) {
				ctx.fillText("C'est perdu ...", 290, 200);
			}
			else {
				ctx.fillText("C'est gagné !", 300, 200);
			}

	        //Boutons quitter et rejouer
	        ctx.fillStyle = "gray";
	        ctx.font = "28px Arial";
	        ctx.fillRect(260, 400, 162, 50);
	        ctx.fillRect(560, 400, 162, 50);
	        ctx.fillStyle = "black";
	        ctx.fillText("REJOUER", 275, 435);
	        ctx.fillText("QUITTER", 580, 435);

	        //Stats
	        ctx.fillText(`Vies restantes: ${hp}`, 265, 600);
	        ctx.fillText(`Score final: ${score}`, 530, 600);
		}

		
	}

	function refreshJeu() {
		let bubble;
		let index = -1; //Servira à supprimer les bulles "mortes"
		ctx.clearRect(0, 0, width, height);

		for (let i = 0; i < gameBubbles.length; i++) {
			bubble = gameBubbles[i];
			bubble.y += (freq*bubble.velocity)/1000; //qté de déplacement à chaque tick = vitesse * frequence de rafraichissement / 1000 (car c'est des ms)
			if (bubble.y - bubble.radius > height) {
				index = i;

				if (bubble.color == "blue") {
					hp--;
					nbBlue--;
				}
			}
			drawBubble(bubble);
		}

		if (index != -1) { //Si une bulle est sortie du cadre, on la supprime et on en charge une nouvelle si on est en mode infini
			gameBubbles.splice(index, 1);

			if (version == "infini") {
				gameBubbles.push(newBubbleInfinite(lvl));
				gameSize++;
			}

			index = -1;
		}

		if (version == "classique") { //Pour le mode classique : gestion de passage au niveau supérieur
			if (nbBlue <= 0) {
				lvl++; //On passe au niveau suivant
				switch (lvl) {
					case 2:
						initLvl2();
						break;
					case 3:
						initLvl3();
						break;
					case 4:
						initLvl4();
						break;
					case 5:
						initLvl5();
						break;
					default:					
						end("bilan"); //Passage à l'écran de fin
						break;
				}
			}
		}

		else if (version == "infini") { //Pour le mode infini : gestion de la difficulté croissante et l'ajout de bulles
			if (tps >= lvl*10) //Toutes les 10s
				lvlUpInfinite();
		}

		if (hp <= 0)
			end("bilan"); //On lance le bilan si plus de vies en stock

		//Test des collisions
		collideTest();

		//Stats
		ctx.fillStyle = "black";
		ctx.font = "24px Arial";
        ctx.fillText(`Temps de jeu: ${tps}s`, 20, 25);
        ctx.fillText(`Niveau: ${lvl}`, 20, 50);
        ctx.fillText(`Nombre de bulles: ${gameSize}`, 20, 75);
        ctx.fillText(`Score: ${score}`, 20, 100);
        ctx.fillText(`Vies: ${hp}`, 20, 125);
        ctx.fillText("[ESC] pour quitter", 20, 150);
	}


	function refresh() {
		switch (mode) {
			case "accueil":
				refreshAccueilBilan();
				break;
			case "jeu":
				refreshJeu();
				break;
			case "bilan":
				refreshAccueilBilan();
				break;
		}
	}

	function chronometer() {
		tps += 1; //Incrément du chrono
	}


	

	//Fonctions event-------------------------------------------

	function clickJouer(e) {
		let rect = canvas.getBoundingClientRect(); //On récupère la position de la souris PAR RAPPORT AU CANVAS
		let x = e.clientX-rect.left;
		let y = e.clientY-rect.top;

		//CHOIX DU MODE
		if ((x >= 460 && x <= 730) && (y >= 400 && y <= 450)) {
			if (version == "infini")
				version = "classique";
			else if (version == "classique")
				version = "infini";
		}

		//JOUER
		if ((x >= 270 && x <= 395) && (y >= 400 && y <= 450)) {
			canvas.removeEventListener("click", clickJouer);
			canvas.addEventListener("mousemove", setMousePos);

			if (version == "classique") //On charge le bon mode selon la sélection courante
				initLvl1();
			else if (version == "infini")
				initLvlInfinite();

			chronoID = setInterval(chronometer, 1000);
			mode = "jeu"; //On initialise les variables pour le niveau 1 (difficulté, mode, chrono...)
		}
	}

	function clickRejouer(e) {
		let rect = canvas.getBoundingClientRect(); //On récupère la position de la souris PAR RAPPORT AU CANVAS
		let x = e.clientX-rect.left;
		let y = e.clientY-rect.top;

		//REJOUER
		if ((x >= 260 && x <= 422) && (y >= 400 && y <= 450)) {
			canvas.removeEventListener("click", clickRejouer);
			canvas.addEventListener("mousemove", setMousePos);

			if (version == "classique")
				initLvl1();
			else if (version == "infini")
				initLvlInfinite();

			chronoID = setInterval(chronometer, 1000);
			mode = "jeu"; //On initialise les variables pour le niveau 1 (difficulté, mode, chrono...)
		}
		//QUITTER
		if ((e.clientX-rect.left >= 560 && e.clientX-rect.left <= 722) && (e.clientY-rect.top >= 400 && e.clientY-rect.top <= 450)) {
			canvas.removeEventListener("click", clickRejouer);
			canvas.addEventListener("click", clickJouer);
			mode = "accueil"; //On initialise les variables pour le niveau 1 (difficulté, mode, chrono...)
		}
	}

	//Collisions
	function setMousePos(e) {
		let rect = canvas.getBoundingClientRect();
		mouseX = e.clientX-rect.left;
		mouseY = e.clientY-rect.top;
	}

	//Clic clavier
	function keypress(e) {
		if (e.code == "Escape") { //Pour revenir à l'accueil
			if (mode == "jeu") {
				end("accueil");
			}
			else if (mode == "bilan") {
				canvas.removeEventListener("click", clickRejouer);
				canvas.addEventListener("click", clickJouer);
				mode = "accueil"; //On initialise les variables pour le niveau 1 (difficulté, mode, chrono...)
			}
		}
	}

	//Lancement du jeu------------------------------------------

	let refreshID = setInterval(refresh, freq);
	canvas.addEventListener("click", clickJouer);
	canvas.addEventListener("mouseout", function(e){mouseX=-50; mouseY=-50;}); //Si on retire la souris du jeu, la position ne sera pas bloquée au bord
	document.addEventListener("keydown", keypress);

}