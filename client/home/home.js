const images = [
   '../images/img3.jpg',
   '../images/img4.png',
   '../images/img5.png',
   '../images/img6.png',
   '../images/img7.png',
   '../images/img1.png'
];

let current = 0;

setInterval(() => {
  const img = document.getElementById('inspirationImage');
  current = (current + 1) % images.length;
  img.src = images[current];
}, 3000);


