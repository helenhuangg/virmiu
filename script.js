var bm = document.getElementById("bm");
if (bm) {
  bodymovin.loadAnimation({
    container: bm,
    path: "data.json",
    renderer: "svg",
    loop: true,
    autoplay: true,
  });
}

function getScale(element) {
  var rect = element.getBoundingClientRect();
  return rect.width / element.offsetWidth;
}

function initElementDrag() {
  var heroScale = document.querySelector(".hero-scale");
  var elements = document.querySelectorAll(".main-tagline .element");
  if (!heroScale || !elements.length) return;

  elements.forEach(function (element) {
    element.addEventListener("mousedown", function (e) {
      e.preventDefault();

      var parent = element.offsetParent;
      if (!parent) return;

      var scale = getScale(heroScale);
      var parentRect = parent.getBoundingClientRect();
      var elementRect = element.getBoundingClientRect();
      var parentW = parent.offsetWidth;
      var parentH = parent.offsetHeight;
      var offsetX =
        ((e.clientX - elementRect.left) / scale / parentW) * 100;
      var offsetY =
        ((e.clientY - elementRect.top) / scale / parentH) * 100;

      function onMouseMove(e) {
        parentRect = parent.getBoundingClientRect();
        var x =
          ((e.clientX - parentRect.left) / scale / parentW) * 100 - offsetX;
        var y =
          ((e.clientY - parentRect.top) / scale / parentH) * 100 - offsetY;
        element.style.left = x + "%";
        element.style.top = y + "%";
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  });
}

initElementDrag();
