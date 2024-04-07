// Your code here

document.addEventListener("DOMContentLoaded", function () {
  const baseUrl = "http://localhost:3000";

  function fetchMovieDetails(movieId) {
    fetch(`${baseUrl}/films/${movieId}`)
      .then((response) => response.json())
      .then((data) => displayMovieDetails(data))
      .catch((error) => console.error("Error fetching movie details:", error));
  }

  function displayMovieDetails(movie) {
    const poster = document.getElementById("poster");
    poster.src = movie.poster;
    poster.alt = `${movie.title} Poster`;

    const title = document.getElementById("title");
    title.textContent = movie.title;

    const runtime = document.getElementById("runtime");
    runtime.textContent = `Runtime: ${movie.runtime} minutes`;

    const filmInfo = document.getElementById("film-info");
    filmInfo.textContent = movie.description;

    const showtime = document.getElementById("showtime");
    showtime.textContent = movie.showtime;

    const availableTickets = movie.capacity - movie.tickets_sold;
    const ticketNum = document.getElementById("ticket-num");
    ticketNum.textContent = availableTickets;

    updateBuyTicketButton(availableTickets);

    // Add event listener to "Buy Ticket" button
    const buyTicketButton = document.getElementById("buy-ticket");
    buyTicketButton.addEventListener("click", () =>
      buyTicket(movie.id, availableTickets)
    );
  }

  function updateBuyTicketButton(availableTickets) {
    const buyTicketButton = document.getElementById("buy-ticket");
    buyTicketButton.disabled = availableTickets === 0;
    buyTicketButton.textContent =
      availableTickets === 0 ? "Sold Out" : "Buy Ticket";
  }

  function buyTicket(movieId, availableTickets) {
    if (availableTickets > 0) {
      // Update tickets sold count on server
      fetch(`${baseUrl}/films/${movieId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tickets_sold: availableTickets + 1 }),
      })
        .then((response) => response.json())
        .then((updatedMovie) => {
          // Update UI with updated movie details
          displayMovieDetails(updatedMovie);
          console.log("Ticket purchased successfully!");
        })
        .catch((error) => console.error("Error purchasing ticket:", error));
    } else {
      alert("Sorry, this movie is sold out!");
    }
  }

  function fetchMovieList() {
    fetch(`${baseUrl}/films`)
      .then((response) => response.json())
      .then((data) => displayMoviesList(data))
      .catch((error) => console.error("Error fetching movie list:", error));
  }

  function displayMoviesList(movies) {
    const movieList = document.getElementById("films");
    const placeholderItem = movieList.querySelector(".film.item");
    if (placeholderItem) {
      movieList.removeChild(placeholderItem);
    }

    movies.forEach((movie) => {
      const movieItem = document.createElement("li");
      movieItem.classList.add("film", "item");
      movieItem.textContent = movie.title;
      movieItem.dataset.movieId = movie.id;

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deleteMovie(movie.id));
      movieItem.appendChild(deleteButton);

      movieList.appendChild(movieItem);

      updateBuyTicketButton(movie.capacity - movie.tickets_sold); // Update button based on movie's tickets_sold
    });

    movieList.addEventListener("click", (event) => {
      if (event.target.classList.contains("film", "item")) {
        const movieId = event.target.dataset.movieId;
        fetchMovieDetails(movieId);
      }
    });
  }

  function deleteMovie(movieId) {
    fetch(`${baseUrl}/films/${movieId}`, { method: "DELETE" })
      .then(() => {
        const movieItem = document.querySelector(
          `.film.item[data-movie-id="${movieId}"]`
        );
        if (movieItem) {
          movieItem.remove();
        }
      })
      .catch((error) => console.error("Error deleting movie:", error));
  }

  // Fetch and display list of all movies on page load
  fetchMovieList();
});
