const listItem = document.querySelector(".life-list__item");

if (listItem) {
  listItem.addEventListener("mouseover", (e) => {
    listItem.style.cursor = "pointer";
  });

  listItem.addEventListener(
    "click",
    (e) => {
      console.log("capturing");
      window.location.href = "/food";
    },
    true
  );
}

const greeting = function () {
  let message;

  const date = new Date().getHours();
  if (date > 18 || date < 3) {
    message = "good evening 🌙";
  } else if (date > 3 && date < 12) {
    message = "good morning ☀️";
  } else {
    message = "good afternoon 🌅";
  }

  return message;
};
