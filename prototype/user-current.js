window.onload = function() {
    fetch('user-current.json')
        .then(response => response.json())
        .then(data => {
            const ul = document.querySelector('ul');

            // Filter the data to get images that start with "https://i.scdn.co/image/"
            const filteredImages = data
                .map(item => item.album.url)
                .filter(url => url.startsWith("https://i.scdn.co/image/"));

            // Remove duplicates
            const uniqueImages = [...new Set(filteredImages)];

            uniqueImages.forEach(url => {
                const li = document.createElement('li');
                const img = document.createElement('img');
                img.src = url;
                img.alt = url;
                li.appendChild(img);
                ul.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error loading images:', error);
        });
};