/* =====================================================================
       UNIVERSAL MATH PARSER - supports all functions + polynomials
       ===================================================================== */
      function parseMathExpr(expr) {
        var s = expr.trim();
        s = s.replace(/\s+/g, " ");

        // Replace constants
        s = s.replace(/\bpi\b/gi, "(Math.PI)");
        // Replace 'e' only when standalone (not part of exp, ceil, etc)
        s = s.replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, "(Math.E)");

        // Replace math functions (longer names first to avoid partial matches)
        var funcs = [
          ["arcsinh", "Math.asinh"],
          ["arccosh", "Math.acosh"],
          ["arctanh", "Math.atanh"],
          ["arcsin", "Math.asin"],
          ["arccos", "Math.acos"],
          ["arctan", "Math.atan"],
          ["asinh", "Math.asinh"],
          ["acosh", "Math.acosh"],
          ["atanh", "Math.atanh"],
          ["asin", "Math.asin"],
          ["acos", "Math.acos"],
          ["atan2", "Math.atan2"],
          ["atan", "Math.atan"],
          ["sinh", "Math.sinh"],
          ["cosh", "Math.cosh"],
          ["tanh", "Math.tanh"],
          ["sqrt", "Math.sqrt"],
          ["cbrt", "Math.cbrt"],
          ["sin", "Math.sin"],
          ["cos", "Math.cos"],
          ["tan", "Math.tan"],
          ["log10", "Math.log10"],
          ["log2", "Math.log2"],
          ["log", "Math.log"],
          ["ln", "Math.log"],
          ["exp", "Math.exp"],
          ["abs", "Math.abs"],
          ["sign", "Math.sign"],
          ["floor", "Math.floor"],
          ["ceil", "Math.ceil"],
          ["round", "Math.round"],
          ["max", "Math.max"],
          ["min", "Math.min"],
          ["pow", "Math.pow"],
          ["trunc", "Math.trunc"],
          ["hypot", "Math.hypot"],
          ["sec", "__sec__"],
          ["csc", "__csc__"],
          ["cot", "__cot__"],
        ];

        for (var i = 0; i < funcs.length; i++) {
          var name = funcs[i][0],
            repl = funcs[i][1];
          var re = new RegExp("\\b" + name + "\\s*\\(", "gi");
          s = s.replace(re, repl + "(");
        }

        // Power operator
        s = s.replace(/\^/g, "**");

        // Implicit multiplication
        // digit before letter (but not part of Math. or __sec__ etc)
        s = s.replace(/(\d)([a-zA-Z_])/g, function (m, d, l) {
          // Check if this is the start of Math. or __
          if (l === "M" || l === "_") {
            // Look ahead to check
            return d + "*" + l;
          }
          return d + "*" + l;
        });
        // ) before ( or letter/digit
        s = s.replace(/\)\s*\(/g, ")*(");
        s = s.replace(/\)\s*([a-zA-Z0-9_])/g, ")*$1");
        // digit or ) before (
        s = s.replace(/(\d)\s*\(/g, "$1*(");
        // variable before (
        s = s.replace(/\bx\s*\(/g, "x*(");

        return s;
      }

      function createSafeFunction(expr) {
        var processed = parseMathExpr(expr);
        var body =
          "try {" +
          "var __sec__ = function(v) { return 1/Math.cos(v); };" +
          "var __csc__ = function(v) { return 1/Math.sin(v); };" +
          "var __cot__ = function(v) { return Math.cos(v)/Math.sin(v); };" +
          "var r = " +
          processed +
          ";" +
          'return (typeof r === "number" && isFinite(r)) ? r : NaN;' +
          "} catch(e) { return NaN; }";
        var fn = new Function("x", body);
        // Test the function
        fn(0);
        fn(1);
        fn(-1);
        fn(0.5);
        fn(2);
        return fn;
      }

      /* =====================================================================
       NAVIGATION
       ===================================================================== */
      var currentLesson = 0;

  function openLesson(num) {
  window.location.href = "lessons/bai" + num + ".html";
}

      function goHome() {
        document.getElementById("landing-page").style.display = "flex";
        document.getElementById("back-btn").style.display = "none";
        document.getElementById("lesson1").classList.remove("active");
        document.getElementById("lesson2").classList.remove("active");
        currentLesson = 0;
      }

      /* =====================================================================
       LESSON 1: VOLUME OF REVOLUTION
       ===================================================================== */
      var L1 = {
        initialized: false,
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
        solidGroup: null,
        diskGroup: null,
        curveGroup: null,
        params: { a: 0, b: 4, alpha: 360, n: 20, k: 1 },
        animAlpha: false,
        animN: false,
        isDragging: false,
        currentFuncStr: "sqrt(x)",
        f: null,

        init: function () {
          var self = this;
          this.f = function (x) {
            return Math.sqrt(Math.max(0, x));
          };
          this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
          this.raycaster = new THREE.Raycaster();
          this.mouse = new THREE.Vector2();
          this.dragOffset = new THREE.Vector3();

          var container = document.getElementById("container3d");
          this.scene = new THREE.Scene();
          this.scene.background = new THREE.Color(0xf5f5f5);
          this.camera = new THREE.PerspectiveCamera(
            50,
            container.clientWidth / container.clientHeight,
            0.01,
            200,
          );
          this.camera.position.set(7, 4, 6);

          this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
          });
          this.renderer.setSize(container.clientWidth, container.clientHeight);
          this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          container.appendChild(this.renderer.domElement);

          this.controls = new THREE.OrbitControls(
            this.camera,
            this.renderer.domElement,
          );
          this.controls.target.set(2, 0, 0);
          this.controls.enableDamping = true;
          this.controls.dampingFactor = 0.08;
          this.controls.enablePan = true;
          this.controls.update();

          this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
          var dl = new THREE.DirectionalLight(0xffffff, 0.65);
          dl.position.set(8, 12, 10);
          this.scene.add(dl);
          var dl2 = new THREE.DirectionalLight(0xffffff, 0.25);
          dl2.position.set(-5, -3, -5);
          this.scene.add(dl2);

          this.createAxes();
          this.scene.add(new THREE.GridHelper(20, 20, 0xbbbbbb, 0xdddddd));

          this.solidGroup = new THREE.Group();
          this.diskGroup = new THREE.Group();
          this.curveGroup = new THREE.Group();
          this.scene.add(this.solidGroup);
          this.scene.add(this.diskGroup);
          this.scene.add(this.curveGroup);

          this.setupDrag(container);
          this.setupSliders();
          this.updateAll();

          function animate() {
            requestAnimationFrame(animate);
            self.controls.update();
            self.renderer.render(self.scene, self.camera);
          }
          animate();
          this.initialized = true;
        },

        createAxes: function () {
          this.scene.add(
            new THREE.ArrowHelper(
              new THREE.Vector3(1, 0, 0),
              new THREE.Vector3(-1, 0, 0),
              12,
              0xdd0000,
              0.25,
              0.12,
            ),
          );
          this.scene.add(
            new THREE.ArrowHelper(
              new THREE.Vector3(0, 1, 0),
              new THREE.Vector3(0, -1, 0),
              6,
              0x00aa00,
              0.25,
              0.12,
            ),
          );
          this.scene.add(
            new THREE.ArrowHelper(
              new THREE.Vector3(0, 0, 1),
              new THREE.Vector3(0, 0, -1),
              6,
              0x0044dd,
              0.25,
              0.12,
            ),
          );
          var labels = ["x", "y", "z"];
          var colors = ["#dd0000", "#00aa00", "#0044dd"];
          var positions = [
            new THREE.Vector3(11.5, 0.4, 0),
            new THREE.Vector3(0.4, 5.5, 0),
            new THREE.Vector3(0, 0.4, 5.5),
          ];
          for (var i = 0; i < 3; i++) {
            var canvas = document.createElement("canvas");
            canvas.width = 64;
            canvas.height = 64;
            var ctx = canvas.getContext("2d");
            ctx.font = "bold 48px Arial";
            ctx.fillStyle = colors[i];
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(labels[i], 32, 32);
            var tex = new THREE.CanvasTexture(canvas);
            var sprite = new THREE.Sprite(
              new THREE.SpriteMaterial({ map: tex }),
            );
            sprite.position.copy(positions[i]);
            sprite.scale.set(0.6, 0.6, 1);
            this.scene.add(sprite);
          }
        },

        clearGroup: function (group) {
          while (group.children.length > 0) {
            var c = group.children[0];
            if (c.geometry) c.geometry.dispose();
            if (c.material) {
              if (c.material.map) c.material.map.dispose();
              c.material.dispose();
            }
            group.remove(c);
          }
        },

        buildSolid: function () {
          this.clearGroup(this.solidGroup);
          this.clearGroup(this.curveGroup);
          var a = this.params.a,
            b = this.params.b,
            alpha = this.params.alpha;
          var alphaRad = (alpha * Math.PI) / 180;
          if (b <= a || alphaRad <= 0) return;

          var nU = 80,
            nV = 64;
          var mat = new THREE.MeshPhongMaterial({
            color: 0x9999cc,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          var self = this;

          var verts = [],
            idx = [];
          for (var i = 0; i <= nU; i++) {
            var u = a + ((b - a) * i) / nU;
            var r = Math.abs(self.f(u)) || 0;
            for (var j = 0; j <= nV; j++) {
              var th = (alphaRad * j) / nV;
              verts.push(u, r * Math.cos(th), r * Math.sin(th));
            }
          }
          for (var i = 0; i < nU; i++) {
            for (var j = 0; j < nV; j++) {
              var p = i * (nV + 1) + j;
              idx.push(p, p + 1, p + nV + 1);
              idx.push(p + 1, p + nV + 2, p + nV + 1);
            }
          }
          var surfGeo = new THREE.BufferGeometry();
          surfGeo.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(verts, 3),
          );
          surfGeo.setIndex(idx);
          surfGeo.computeVertexNormals();
          this.solidGroup.add(new THREE.Mesh(surfGeo, mat));

          // End caps
          var caps = [a, b];
          for (var ci = 0; ci < caps.length; ci++) {
            var x = caps[ci];
            var r = Math.abs(self.f(x)) || 0;
            if (r < 0.001) continue;
            var cv = [x, 0, 0],
              cIdx = [];
            for (var j = 0; j <= nV; j++) {
              var th = (alphaRad * j) / nV;
              cv.push(x, r * Math.cos(th), r * Math.sin(th));
            }
            for (var j = 0; j < nV; j++) cIdx.push(0, j + 1, j + 2);
            var g = new THREE.BufferGeometry();
            g.setAttribute("position", new THREE.Float32BufferAttribute(cv, 3));
            g.setIndex(cIdx);
            g.computeVertexNormals();
            this.solidGroup.add(new THREE.Mesh(g, mat.clone()));
          }

          // Flat sides
          if (alpha < 359.5) {
            var thetas = [0, alphaRad];
            for (var ti = 0; ti < thetas.length; ti++) {
              var theta = thetas[ti];
              var sv = [],
                si = [];
              for (var i = 0; i <= nU; i++) {
                var u = a + ((b - a) * i) / nU;
                var r = Math.abs(self.f(u)) || 0;
                sv.push(u, 0, 0);
                sv.push(u, r * Math.cos(theta), r * Math.sin(theta));
              }
              for (var i = 0; i < nU; i++) {
                var p = i * 2;
                si.push(p, p + 1, p + 2);
                si.push(p + 1, p + 3, p + 2);
              }
              var g = new THREE.BufferGeometry();
              g.setAttribute(
                "position",
                new THREE.Float32BufferAttribute(sv, 3),
              );
              g.setIndex(si);
              g.computeVertexNormals();
              this.solidGroup.add(new THREE.Mesh(g, mat.clone()));
            }
          }

          // Profile curve
          var curvePoints = [];
          for (var i = 0; i <= nU; i++) {
            var u = a + ((b - a) * i) / nU;
            curvePoints.push(new THREE.Vector3(u, Math.abs(self.f(u)) || 0, 0));
          }
          this.curveGroup.add(
            new THREE.Line(
              new THREE.BufferGeometry().setFromPoints(curvePoints),
              new THREE.LineBasicMaterial({ color: 0xdd0000, linewidth: 2 }),
            ),
          );

          if (alpha >= 180) {
            var bp = [];
            for (var i = 0; i <= nU; i++) {
              var u = a + ((b - a) * i) / nU;
              bp.push(new THREE.Vector3(u, -(Math.abs(self.f(u)) || 0), 0));
            }
            this.curveGroup.add(
              new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(bp),
                new THREE.LineBasicMaterial({ color: 0xdd0000, linewidth: 1 }),
              ),
            );
          }

          // Edge circles
          for (var ci = 0; ci < caps.length; ci++) {
            var x = caps[ci];
            var r = Math.abs(self.f(x)) || 0;
            if (r < 0.001) continue;
            var cp = [];
            for (var j = 0; j <= 64; j++) {
              var th = (alphaRad * j) / 64;
              cp.push(new THREE.Vector3(x, r * Math.cos(th), r * Math.sin(th)));
            }
            this.curveGroup.add(
              new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(cp),
                new THREE.LineBasicMaterial({ color: 0xdd0000 }),
              ),
            );
          }
        },

        buildDisks: function () {
          this.clearGroup(this.diskGroup);
          var a = this.params.a,
            b = this.params.b,
            n = this.params.n,
            k = this.params.k,
            alpha = this.params.alpha;
          var alphaRad = (alpha * Math.PI) / 180;
          if (b <= a || n <= 0 || alphaRad <= 0) return;
          var dx = (b - a) / n;
          var self = this;
          for (var i = 0; i < n; i++) {
            var xi = a + i * dx;
            var radius = Math.abs(self.f(xi)) || 0;
            if (radius < 0.0005) continue;
            var isK = i === k - 1;
            var geo = new THREE.CylinderGeometry(
              radius,
              radius,
              dx,
              32,
              1,
              false,
              0,
              alphaRad,
            );
            var mat = new THREE.MeshPhongMaterial({
              color: isK ? 0xffcc00 : 0xff6699,
              transparent: true,
              opacity: isK ? 0.75 : 0.4,
              side: THREE.DoubleSide,
              depthWrite: false,
            });
            var mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.z = -Math.PI / 2;
            mesh.position.x = xi + dx / 2;
            this.diskGroup.add(mesh);
          }
          this.diskGroup.position.copy(this.solidGroup.position);
        },

        updateVolumes: function () {
          var a = this.params.a,
            b = this.params.b,
            n = this.params.n,
            k = this.params.k;
          var self = this;
          if (b <= a) {
            document.getElementById("exact-vol").textContent = "0";
            document.getElementById("approx-vol").textContent = "0";
            document.getElementById("error-vol").textContent = "0";
            return;
          }
          var N = 2000,
            h = (b - a) / N,
            simpson = 0;
          for (var i = 0; i <= N; i++) {
            var x = a + i * h;
            var fv = self.f(x);
            var y = Math.PI * fv * fv;
            simpson +=
              (isFinite(y) ? y : 0) *
              (i === 0 || i === N ? 1 : i % 2 === 1 ? 4 : 2);
          }
          var exactVol = (simpson * h) / 3;
          var dx = (b - a) / n,
            riemannSum = 0;
          for (var i = 0; i < n; i++) {
            var xi = a + i * dx;
            var fv = self.f(xi);
            riemannSum += Math.PI * fv * fv * dx;
          }
          document.getElementById("exact-vol").textContent = isFinite(exactVol)
            ? exactVol.toFixed(4)
            : "N/A";
          document.getElementById("approx-vol").textContent = isFinite(
            riemannSum,
          )
            ? riemannSum.toFixed(4)
            : "N/A";
          document.getElementById("error-vol").textContent =
            isFinite(exactVol) && isFinite(riemannSum)
              ? Math.abs(exactVol - riemannSum).toFixed(4)
              : "N/A";

          var kIdx = Math.min(k, n) - 1;
          var xk = a + kIdx * dx;
          var rk = Math.abs(self.f(xk)) || 0;
          var dvk = Math.PI * rk * rk * dx;
          document.getElementById("disk-info").innerHTML =
            "L\u00e1t c\u1eaft <span>k=" +
            k +
            "</span>: x<sub>" +
            k +
            "</sub> = " +
            xk.toFixed(2) +
            ", r = f(" +
            xk.toFixed(2) +
            ") = " +
            rk.toFixed(3) +
            ", \u0394V<sub>" +
            k +
            "</sub> = " +
            dvk.toFixed(4);
        },

        draw2DGraph: function () {
          var canvas = document.getElementById("graph2d");
          var rect = canvas.parentElement.getBoundingClientRect();
          var dpr = Math.min(window.devicePixelRatio || 1, 2);
          var W = Math.floor(rect.width - 16);
          var H = Math.floor(rect.height - 40);
          if (W <= 0 || H <= 0) return;
          canvas.width = W * dpr;
          canvas.height = H * dpr;
          canvas.style.width = W + "px";
          canvas.style.height = H + "px";
          var ctx = canvas.getContext("2d");
          ctx.scale(dpr, dpr);

          var a = this.params.a,
            b = this.params.b,
            n = this.params.n,
            k = this.params.k;
          var self = this;
          var margin = 35;
          var xMin = Math.min(a - 0.5, -0.5);
          var xMax = Math.max(b + 1.5, 5);
          var yMaxCalc = 0;
          for (var i = 0; i <= 200; i++) {
            var x = xMin + ((xMax - xMin) * i) / 200;
            var fv = self.f(x);
            if (isFinite(fv) && Math.abs(fv) > yMaxCalc)
              yMaxCalc = Math.abs(fv);
          }
          var yMax = Math.max(yMaxCalc * 1.3 + 0.5, 2.5);
          var yMin = -0.3;
          var pW = W - 2 * margin,
            pH = H - 2 * margin;
          var sx = pW / (xMax - xMin),
            sy = pH / (yMax - yMin);
          var tx = function (x) {
            return margin + (x - xMin) * sx;
          };
          var ty = function (y) {
            return H - margin - (y - yMin) * sy;
          };

          ctx.fillStyle = "#fafafa";
          ctx.fillRect(0, 0, W, H);

          ctx.strokeStyle = "#e8e8e8";
          ctx.lineWidth = 0.5;
          for (var x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
            ctx.beginPath();
            ctx.moveTo(tx(x), ty(yMin));
            ctx.lineTo(tx(x), ty(yMax));
            ctx.stroke();
          }
          for (var y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
            ctx.beginPath();
            ctx.moveTo(tx(xMin), ty(y));
            ctx.lineTo(tx(xMax), ty(y));
            ctx.stroke();
          }

          ctx.strokeStyle = "#333";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(tx(xMin), ty(0));
          ctx.lineTo(tx(xMax), ty(0));
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(tx(0), ty(yMin));
          ctx.lineTo(tx(0), ty(yMax));
          ctx.stroke();

          ctx.fillStyle = "#555";
          ctx.font = "11px Arial";
          ctx.textAlign = "center";
          for (var x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
            if (x === 0) continue;
            ctx.fillText(x, tx(x), ty(0) + 14);
          }
          ctx.textAlign = "right";
          for (var y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
            if (y === 0) continue;
            ctx.fillText(y, tx(0) - 5, ty(y) + 4);
          }

          if (b > a) {
            ctx.beginPath();
            ctx.moveTo(tx(a), ty(0));
            for (var px = 0; px <= 200; px++) {
              var x = a + ((b - a) * px) / 200;
              ctx.lineTo(tx(x), ty(Math.abs(self.f(x)) || 0));
            }
            ctx.lineTo(tx(b), ty(0));
            ctx.closePath();
            ctx.fillStyle = "rgba(100,150,255,0.10)";
            ctx.fill();
          }

          if (b > a && n > 0) {
            var dx = (b - a) / n;
            for (var i = 0; i < n; i++) {
              var xi = a + i * dx;
              var yi = Math.abs(self.f(xi)) || 0;
              if (yi < 0.001) continue;
              var isK = i === k - 1;
              ctx.fillStyle = isK
                ? "rgba(255,200,0,0.50)"
                : "rgba(255,100,150,0.25)";
              ctx.fillRect(tx(xi), ty(yi), dx * sx, yi * sy);
              ctx.strokeStyle = isK ? "#e68a00" : "#e06688";
              ctx.lineWidth = isK ? 2 : 0.8;
              ctx.strokeRect(tx(xi), ty(yi), dx * sx, yi * sy);
            }
          }

          ctx.beginPath();
          ctx.strokeStyle = "#1565C0";
          ctx.lineWidth = 2.5;
          var started = false;
          for (var px = 0; px <= pW; px++) {
            var x = xMin + px / sx;
            var y = self.f(x);
            var ay = Math.abs(y);
            if (!isFinite(ay)) {
              started = false;
              continue;
            }
            if (!started) {
              ctx.moveTo(tx(x), ty(ay));
              started = true;
            } else ctx.lineTo(tx(x), ty(ay));
          }
          ctx.stroke();

          ctx.fillStyle = "#1565C0";
          ctx.font = "italic 13px Arial";
          ctx.textAlign = "left";
          var lx = Math.min(b * 0.8 + 0.5, xMax - 1.5);
          var ly = Math.abs(self.f(Math.max(lx, 0.1))) || 0;
          if (isFinite(ly))
            ctx.fillText("f(x) = " + self.currentFuncStr, tx(lx), ty(ly) - 8);

          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = "#c62828";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(tx(a), ty(0));
          ctx.lineTo(tx(a), ty(Math.abs(self.f(a)) || 0));
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(tx(b), ty(0));
          ctx.lineTo(tx(b), ty(Math.abs(self.f(b)) || 0));
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = "#c62828";
          ctx.font = "bold 12px Arial";
          ctx.textAlign = "center";
          ctx.fillText("a=" + a.toFixed(1), tx(a), ty(0) + 26);
          ctx.fillText("b=" + b.toFixed(1), tx(b), ty(0) + 26);
          ctx.fillStyle = "#333";
          ctx.font = "bold 13px Arial";
          ctx.textAlign = "right";
          ctx.fillText("x", tx(xMax) - 2, ty(0) - 6);
          ctx.textAlign = "left";
          ctx.fillText("y", tx(0) + 6, ty(yMax) + 14);
        },

        updateAll: function () {
          this.buildSolid();
          this.buildDisks();
          this.updateVolumes();
          this.draw2DGraph();
        },

        setupSliders: function () {
          var self = this;
          var sa = document.getElementById("slider-a");
          var sb = document.getElementById("slider-b");
          var sal = document.getElementById("slider-alpha");
          var sn = document.getElementById("slider-n");
          var sk = document.getElementById("slider-k");

          sa.addEventListener("input", function (e) {
            self.params.a = parseFloat(e.target.value);
            document.getElementById("val-a").textContent =
              self.params.a.toFixed(1);
            if (self.params.a >= self.params.b) {
              self.params.b = self.params.a + 0.1;
              sb.value = self.params.b;
              document.getElementById("val-b").textContent =
                self.params.b.toFixed(1);
            }
            sk.max = self.params.n;
            self.updateAll();
          });
          sb.addEventListener("input", function (e) {
            self.params.b = parseFloat(e.target.value);
            if (self.params.b <= self.params.a) {
              self.params.b = self.params.a + 0.1;
              e.target.value = self.params.b;
            }
            document.getElementById("val-b").textContent =
              self.params.b.toFixed(1);
            self.updateAll();
          });
          sal.addEventListener("input", function (e) {
            self.params.alpha = parseInt(e.target.value);
            document.getElementById("val-alpha").textContent =
              self.params.alpha + "\u00B0";
            self.updateAll();
          });
          sn.addEventListener("input", function (e) {
            self.params.n = parseInt(e.target.value);
            document.getElementById("val-n").textContent = self.params.n;
            sk.max = self.params.n;
            if (self.params.k > self.params.n) {
              self.params.k = self.params.n;
              sk.value = self.params.k;
              document.getElementById("val-k").textContent = self.params.k;
            }
            self.updateAll();
          });
          sk.addEventListener("input", function (e) {
            self.params.k = parseInt(e.target.value);
            document.getElementById("val-k").textContent = self.params.k;
            self.buildDisks();
            self.updateVolumes();
            self.draw2DGraph();
          });
          document
            .getElementById("func-input")
            .addEventListener("keydown", function (e) {
              if (e.key === "Enter") applyFunction();
            });
        },

        setupDrag: function (container) {
          var self = this;
          container.addEventListener("mousedown", function (e) {
            if (!e.shiftKey) return;
            self.isDragging = true;
            self.controls.enabled = false;
            var rect = self.renderer.domElement.getBoundingClientRect();
            self.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            self.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            self.raycaster.setFromCamera(self.mouse, self.camera);
            var pt = new THREE.Vector3();
            self.raycaster.ray.intersectPlane(self.dragPlane, pt);
            if (pt) self.dragOffset.copy(self.solidGroup.position).sub(pt);
          });
          container.addEventListener("mousemove", function (e) {
            if (!self.isDragging) return;
            var rect = self.renderer.domElement.getBoundingClientRect();
            self.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            self.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            self.raycaster.setFromCamera(self.mouse, self.camera);
            var pt = new THREE.Vector3();
            self.raycaster.ray.intersectPlane(self.dragPlane, pt);
            if (pt) {
              var newPos = pt.add(self.dragOffset);
              self.solidGroup.position.copy(newPos);
              self.diskGroup.position.copy(newPos);
              self.curveGroup.position.copy(newPos);
            }
          });
          var endDrag = function () {
            self.isDragging = false;
            self.controls.enabled = true;
          };
          container.addEventListener("mouseup", endDrag);
          container.addEventListener("mouseleave", endDrag);
        },

        onResize: function () {
          if (!this.initialized) return;
          var container = document.getElementById("container3d");
          this.camera.aspect = container.clientWidth / container.clientHeight;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(container.clientWidth, container.clientHeight);
          this.draw2DGraph();
        },
      };

      // Global L1 button functions
      function applyFunction() {
        var expr = document.getElementById("func-input").value.trim();
        if (!expr) return;
        try {
          var fn = createSafeFunction(expr);
          L1.f = function (x) {
            var v = fn(x);
            return isFinite(v) ? Math.abs(v) : 0;
          };
          L1.currentFuncStr = expr;
          L1.updateAll();
        } catch (e) {
          alert(
            "H\u00e0m kh\u00f4ng h\u1ee3p l\u1ec7! V\u00ed d\u1ee5: sqrt(x), x^2, sin(x), x^3-2x+1",
          );
        }
      }

      function togglePlayAlpha() {
        L1.animAlpha = !L1.animAlpha;
        document
          .getElementById("btn-play-alpha")
          .classList.toggle("active", L1.animAlpha);
        document.getElementById("btn-play-alpha").textContent = L1.animAlpha
          ? "\u23F9 D\u1eebng \u03B1"
          : "\u25B6 Quay \u03B1";
        if (L1.animAlpha) {
          L1.params.alpha = 0;
          var slider = document.getElementById("slider-alpha");
          var tick = function () {
            if (!L1.animAlpha) return;
            L1.params.alpha += 2;
            if (L1.params.alpha > 360) {
              L1.params.alpha = 360;
              L1.animAlpha = false;
              document
                .getElementById("btn-play-alpha")
                .classList.remove("active");
              document.getElementById("btn-play-alpha").textContent =
                "\u25B6 Quay \u03B1";
            }
            slider.value = L1.params.alpha;
            document.getElementById("val-alpha").textContent =
              L1.params.alpha + "\u00B0";
            L1.updateAll();
            if (L1.animAlpha) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      }

      function togglePlayN() {
        L1.animN = !L1.animN;
        document
          .getElementById("btn-play-n")
          .classList.toggle("active", L1.animN);
        document.getElementById("btn-play-n").textContent = L1.animN
          ? "\u23F9 D\u1eebng n"
          : "\u25B6 T\u0103ng n";
        if (L1.animN) {
          L1.params.n = 1;
          var slider = document.getElementById("slider-n");
          var sk = document.getElementById("slider-k");
          var counter = 0;
          var tick = function () {
            if (!L1.animN) return;
            counter++;
            if (counter % 8 === 0) {
              L1.params.n++;
              if (L1.params.n > 100) {
                L1.params.n = 100;
                L1.animN = false;
                document
                  .getElementById("btn-play-n")
                  .classList.remove("active");
                document.getElementById("btn-play-n").textContent =
                  "\u25B6 T\u0103ng n";
              }
              slider.value = L1.params.n;
              document.getElementById("val-n").textContent = L1.params.n;
              sk.max = L1.params.n;
              if (L1.params.k > L1.params.n) {
                L1.params.k = L1.params.n;
                sk.value = L1.params.k;
              }
              L1.updateAll();
            }
            if (L1.animN) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      }

      function resetView() {
        L1.camera.position.set(7, 4, 6);
        L1.controls.target.set(2, 0, 0);
        L1.controls.update();
        L1.solidGroup.position.set(0, 0, 0);
        L1.diskGroup.position.set(0, 0, 0);
        L1.curveGroup.position.set(0, 0, 0);
      }

      /* =====================================================================
       LESSON 2: DEFINITE INTEGRAL + RIEMANN SUM
       ===================================================================== */
      var L2 = {
        initialized: false,
        canvas: null,
        ctx: null,
        funcStr: "x^2 - 2x + 3",
        f: null,
        params: { a: -1, b: 9, n: 50 },
        method: "left",
        animN: false,
        isDragging: false,
        lastMouse: null,
        viewXMin: -3,
        viewXMax: 12,
        viewYMin: -5,
        viewYMax: 90,

        init: function () {
          this.canvas = document.getElementById("l2-canvas");
          this.ctx = this.canvas.getContext("2d");
          try {
            this.f = createSafeFunction(this.funcStr);
          } catch (e) {
            this.f = function (x) {
              return x * x - 2 * x + 3;
            };
          }
          this.setupSliders();
          this.setupInteraction();
          this.autoFitView();
          this.draw();
          this.initialized = true;
        },

        applyFunction: function () {
          var expr = document.getElementById("l2-func-input").value.trim();
          if (!expr) return;
          try {
            var fn = createSafeFunction(expr);
            this.f = fn;
            this.funcStr = expr;
            this.autoFitView();
            this.draw();
          } catch (e) {
            alert(
              "H\u00e0m kh\u00f4ng h\u1ee3p l\u1ec7! V\u00ed d\u1ee5: x^2, sin(x), x^3-2x+1, exp(-x^2)",
            );
          }
        },

        autoFitView: function () {
          var a = this.params.a,
            b = this.params.b;
          var margin = Math.abs(b - a) * 0.2;
          this.viewXMin = Math.min(a, b) - margin - 1;
          this.viewXMax = Math.max(a, b) + margin + 1;
          var yMin = Infinity,
            yMax = -Infinity;
          for (var i = 0; i <= 300; i++) {
            var x = this.viewXMin + ((this.viewXMax - this.viewXMin) * i) / 300;
            var y = this.f(x);
            if (isFinite(y)) {
              if (y < yMin) yMin = y;
              if (y > yMax) yMax = y;
            }
          }
          if (!isFinite(yMin)) yMin = -5;
          if (!isFinite(yMax)) yMax = 5;
          var yMargin = Math.max((yMax - yMin) * 0.15, 1);
          this.viewYMin = yMin - yMargin;
          this.viewYMax = yMax + yMargin;
          if (this.viewYMin > -0.5) this.viewYMin = -0.5 - yMargin * 0.3;
        },

        setMethod: function (m) {
          this.method = m;
          var methods = ["left", "right", "mid", "trap"];
          for (var i = 0; i < methods.length; i++) {
            document.getElementById("l2-btn-" + methods[i]).style.background =
              methods[i] === m ? "#6a1b9a" : "#3a3a5a";
          }
          this.draw();
        },

        togglePlay: function () {
          var self = this;
          this.animN = !this.animN;
          document
            .getElementById("l2-btn-play")
            .classList.toggle("active", this.animN);
          document.getElementById("l2-btn-play").textContent = this.animN
            ? "\u23F9 D\u1eebng"
            : "\u25B6 T\u0103ng n";
          if (this.animN) {
            this.params.n = 1;
            var slider = document.getElementById("l2-slider-n");
            var counter = 0;
            var tick = function () {
              if (!self.animN) return;
              counter++;
              if (counter % 5 === 0) {
                self.params.n++;
                if (self.params.n > 200) {
                  self.params.n = 200;
                  self.animN = false;
                  document
                    .getElementById("l2-btn-play")
                    .classList.remove("active");
                  document.getElementById("l2-btn-play").textContent =
                    "\u25B6 T\u0103ng n";
                }
                slider.value = self.params.n;
                document.getElementById("l2-val-n").textContent = self.params.n;
                self.draw();
              }
              if (self.animN) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        },

        resetView: function () {
          this.autoFitView();
          this.draw();
        },

        setupSliders: function () {
          var self = this;
          document
            .getElementById("l2-slider-a")
            .addEventListener("input", function (e) {
              self.params.a = parseFloat(e.target.value);
              document.getElementById("l2-val-a").textContent =
                self.params.a.toFixed(1);
              self.autoFitView();
              self.draw();
            });
          document
            .getElementById("l2-slider-b")
            .addEventListener("input", function (e) {
              self.params.b = parseFloat(e.target.value);
              document.getElementById("l2-val-b").textContent =
                self.params.b.toFixed(1);
              self.autoFitView();
              self.draw();
            });
          document
            .getElementById("l2-slider-n")
            .addEventListener("input", function (e) {
              self.params.n = parseInt(e.target.value);
              document.getElementById("l2-val-n").textContent = self.params.n;
              self.draw();
            });
          document
            .getElementById("l2-func-input")
            .addEventListener("keydown", function (e) {
              if (e.key === "Enter") self.applyFunction();
            });
        },

        setupInteraction: function () {
          var self = this;
          var c = this.canvas;

          c.addEventListener(
            "wheel",
            function (e) {
              e.preventDefault();
              var rect = c.getBoundingClientRect();
              var mx = (e.clientX - rect.left) / rect.width;
              var my = (e.clientY - rect.top) / rect.height;
              var wx = self.viewXMin + mx * (self.viewXMax - self.viewXMin);
              var wy = self.viewYMax - my * (self.viewYMax - self.viewYMin);
              var factor = e.deltaY > 0 ? 1.1 : 0.9;
              self.viewXMin = wx - (wx - self.viewXMin) * factor;
              self.viewXMax = wx + (self.viewXMax - wx) * factor;
              self.viewYMin = wy - (wy - self.viewYMin) * factor;
              self.viewYMax = wy + (self.viewYMax - wy) * factor;
              self.draw();
            },
            { passive: false },
          );

          c.addEventListener("mousedown", function (e) {
            self.isDragging = true;
            self.lastMouse = { x: e.clientX, y: e.clientY };
          });
          c.addEventListener("mousemove", function (e) {
            if (!self.isDragging || !self.lastMouse) return;
            var rect = c.getBoundingClientRect();
            var dx =
              ((e.clientX - self.lastMouse.x) / rect.width) *
              (self.viewXMax - self.viewXMin);
            var dy =
              ((e.clientY - self.lastMouse.y) / rect.height) *
              (self.viewYMax - self.viewYMin);
            self.viewXMin -= dx;
            self.viewXMax -= dx;
            self.viewYMin += dy;
            self.viewYMax += dy;
            self.lastMouse = { x: e.clientX, y: e.clientY };
            self.draw();
          });
          c.addEventListener("mouseup", function () {
            self.isDragging = false;
            self.lastMouse = null;
          });
          c.addEventListener("mouseleave", function () {
            self.isDragging = false;
            self.lastMouse = null;
          });

          // Touch support
          var lastTouchDist = null,
            lastTouch = null;
          c.addEventListener(
            "touchstart",
            function (e) {
              if (e.touches.length === 1) {
                lastTouch = {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY,
                };
              } else if (e.touches.length === 2) {
                lastTouchDist = Math.hypot(
                  e.touches[1].clientX - e.touches[0].clientX,
                  e.touches[1].clientY - e.touches[0].clientY,
                );
              }
            },
            { passive: true },
          );
          c.addEventListener(
            "touchmove",
            function (e) {
              e.preventDefault();
              if (e.touches.length === 1 && lastTouch) {
                var rect = c.getBoundingClientRect();
                var dx =
                  ((e.touches[0].clientX - lastTouch.x) / rect.width) *
                  (self.viewXMax - self.viewXMin);
                var dy =
                  ((e.touches[0].clientY - lastTouch.y) / rect.height) *
                  (self.viewYMax - self.viewYMin);
                self.viewXMin -= dx;
                self.viewXMax -= dx;
                self.viewYMin += dy;
                self.viewYMax += dy;
                lastTouch = {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY,
                };
                self.draw();
              } else if (e.touches.length === 2 && lastTouchDist) {
                var dist = Math.hypot(
                  e.touches[1].clientX - e.touches[0].clientX,
                  e.touches[1].clientY - e.touches[0].clientY,
                );
                var factor = lastTouchDist / dist;
                var cx = (self.viewXMin + self.viewXMax) / 2;
                var cy = (self.viewYMin + self.viewYMax) / 2;
                var hw = ((self.viewXMax - self.viewXMin) / 2) * factor;
                var hh = ((self.viewYMax - self.viewYMin) / 2) * factor;
                self.viewXMin = cx - hw;
                self.viewXMax = cx + hw;
                self.viewYMin = cy - hh;
                self.viewYMax = cy + hh;
                lastTouchDist = dist;
                self.draw();
              }
            },
            { passive: false },
          );
          c.addEventListener("touchend", function () {
            lastTouch = null;
            lastTouchDist = null;
          });
        },

        draw: function () {
               // ⭐ thêm guard tránh crash
  if (typeof this.f !== "function") return;
          var c = this.canvas;
          var rect = c.parentElement.getBoundingClientRect();
          var dpr = Math.min(window.devicePixelRatio || 1, 2);
          var W = Math.floor(rect.width);
          var H = Math.floor(rect.height);
          if (W <= 0 || H <= 0) return;
          c.width = W * dpr;
          c.height = H * dpr;
          c.style.width = W + "px";
          c.style.height = H + "px";
          var ctx = this.ctx;
ctx.setTransform(1, 0, 0, 1, 0, 0); // ⭐ reset
ctx.scale(dpr, dpr);

          var a = this.params.a,
            b = this.params.b,
            n = this.params.n;
          var self = this;
          var xMin = this.viewXMin,
            xMax = this.viewXMax;
          var yMin = this.viewYMin,
            yMax = this.viewYMax;
          var sx = W / (xMax - xMin);
          var sy = H / (yMax - yMin);
          var tx = function (x) {
            return (x - xMin) * sx;
          };
          var ty = function (y) {
            return H - (y - yMin) * sy;
          };

          // Background
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, W, H);

          // Grid
          var gridStep = function (range) {
            if (range > 100) return 20;
            if (range > 50) return 10;
            if (range > 20) return 5;
            if (range > 10) return 2;
            if (range > 4) return 1;
            if (range > 2) return 0.5;
            return 0.25;
          };
          var gx = gridStep(xMax - xMin);
          var gy = gridStep(yMax - yMin);

          ctx.strokeStyle = "#eee";
          ctx.lineWidth = 0.5;
          for (var x = Math.ceil(xMin / gx) * gx; x <= xMax; x += gx) {
            ctx.beginPath();
            ctx.moveTo(tx(x), 0);
            ctx.lineTo(tx(x), H);
            ctx.stroke();
          }
          for (var y = Math.ceil(yMin / gy) * gy; y <= yMax; y += gy) {
            ctx.beginPath();
            ctx.moveTo(0, ty(y));
            ctx.lineTo(W, ty(y));
            ctx.stroke();
          }

          // Axes
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 1.5;
          if (yMin <= 0 && yMax >= 0) {
            ctx.beginPath();
            ctx.moveTo(0, ty(0));
            ctx.lineTo(W, ty(0));
            ctx.stroke();
          }
          if (xMin <= 0 && xMax >= 0) {
            ctx.beginPath();
            ctx.moveTo(tx(0), 0);
            ctx.lineTo(tx(0), H);
            ctx.stroke();
          }

          // Labels
          ctx.fillStyle = "#666";
          ctx.font = "11px Arial";
          ctx.textAlign = "center";
          for (var x = Math.ceil(xMin / gx) * gx; x <= xMax; x += gx) {
            if (Math.abs(x) < gx * 0.01) continue;
            var label = Number.isInteger(x) ? x.toString() : x.toFixed(1);
            var yPos = yMin <= 0 && yMax >= 0 ? ty(0) + 14 : H - 5;
            ctx.fillText(label, tx(x), yPos);
          }
          ctx.textAlign = "right";
          for (var y = Math.ceil(yMin / gy) * gy; y <= yMax; y += gy) {
            if (Math.abs(y) < gy * 0.01) continue;
            var label = Number.isInteger(y) ? y.toString() : y.toFixed(1);
            var xPos = xMin <= 0 && xMax >= 0 ? tx(0) - 5 : 35;
            if (xPos < 5) xPos = 35;
            ctx.fillText(label, xPos, ty(y) + 4);
          }

          // Riemann rectangles
          var aEff = Math.min(a, b),
            bEff = Math.max(a, b);
          var sign = a <= b ? 1 : -1;
          var dx = n > 0 ? (bEff - aEff) / n : 0;
          var rectAreas = [];

          if (n > 0 && bEff > aEff) {
            for (var i = 0; i < n; i++) {
              var xi = aEff + i * dx;
              var sample, y1, y2;

              if (this.method === "left") {
                sample = self.f(xi);
                if (!isFinite(sample)) sample = 0;
                ctx.fillStyle =
                  sample >= 0
                    ? "rgba(100,180,255,0.35)"
                    : "rgba(255,100,100,0.35)";
                ctx.strokeStyle =
                  sample >= 0 ? "rgba(50,100,200,0.7)" : "rgba(200,50,50,0.7)";
                ctx.lineWidth = 1;
                var rH = Math.abs(sample) * sy;
                var rY = sample >= 0 ? ty(sample) : ty(0);
                ctx.fillRect(tx(xi), rY, dx * sx, rH);
                ctx.strokeRect(tx(xi), rY, dx * sx, rH);
                rectAreas.push(sample * dx * sign);
              } else if (this.method === "right") {
                sample = self.f(xi + dx);
                if (!isFinite(sample)) sample = 0;
                ctx.fillStyle =
                  sample >= 0
                    ? "rgba(100,180,255,0.35)"
                    : "rgba(255,100,100,0.35)";
                ctx.strokeStyle =
                  sample >= 0 ? "rgba(50,100,200,0.7)" : "rgba(200,50,50,0.7)";
                ctx.lineWidth = 1;
                var rH = Math.abs(sample) * sy;
                var rY = sample >= 0 ? ty(sample) : ty(0);
                ctx.fillRect(tx(xi), rY, dx * sx, rH);
                ctx.strokeRect(tx(xi), rY, dx * sx, rH);
                rectAreas.push(sample * dx * sign);
              } else if (this.method === "mid") {
                sample = self.f(xi + dx / 2);
                if (!isFinite(sample)) sample = 0;
                ctx.fillStyle =
                  sample >= 0
                    ? "rgba(100,200,100,0.35)"
                    : "rgba(255,150,50,0.35)";
                ctx.strokeStyle =
                  sample >= 0 ? "rgba(30,150,30,0.7)" : "rgba(200,100,30,0.7)";
                ctx.lineWidth = 1;
                var rH = Math.abs(sample) * sy;
                var rY = sample >= 0 ? ty(sample) : ty(0);
                ctx.fillRect(tx(xi), rY, dx * sx, rH);
                ctx.strokeRect(tx(xi), rY, dx * sx, rH);
                rectAreas.push(sample * dx * sign);
              } else if (this.method === "trap") {
                y1 = self.f(xi);
                y2 = self.f(xi + dx);
                if (!isFinite(y1)) y1 = 0;
                if (!isFinite(y2)) y2 = 0;
                ctx.fillStyle = "rgba(200,150,255,0.35)";
                ctx.strokeStyle = "rgba(120,60,200,0.7)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(tx(xi), ty(0));
                ctx.lineTo(tx(xi), ty(y1));
                ctx.lineTo(tx(xi + dx), ty(y2));
                ctx.lineTo(tx(xi + dx), ty(0));
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                rectAreas.push(((y1 + y2) / 2) * dx * sign);
              }
            }
          }

          // Shaded area
          ctx.beginPath();
          ctx.moveTo(tx(aEff), ty(0));
          for (var i = 0; i <= 400; i++) {
            var x = aEff + ((bEff - aEff) * i) / 400;
            var y = self.f(x);
            if (isFinite(y)) ctx.lineTo(tx(x), ty(y));
          }
          ctx.lineTo(tx(bEff), ty(0));
          ctx.closePath();
          ctx.fillStyle = "rgba(180,100,255,0.08)";
          ctx.fill();

          // Function curve
          ctx.beginPath();
          ctx.strokeStyle = "#1565C0";
          ctx.lineWidth = 2.5;
          var started = false;
          var step = (xMax - xMin) / W;
          for (var x = xMin; x <= xMax; x += step) {
            var y = self.f(x);
            if (!isFinite(y) || Math.abs(y) > 1e8) {
              started = false;
              continue;
            }
            if (!started) {
              ctx.moveTo(tx(x), ty(y));
              started = true;
            } else ctx.lineTo(tx(x), ty(y));
          }
          ctx.stroke();

          // Bound lines
          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = "#c62828";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(tx(a), 0);
          ctx.lineTo(tx(a), H);
          ctx.stroke();
          ctx.strokeStyle = "#2e7d32";
          ctx.beginPath();
          ctx.moveTo(tx(b), 0);
          ctx.lineTo(tx(b), H);
          ctx.stroke();
          ctx.setLineDash([]);

          // Labels
          ctx.fillStyle = "#c62828";
          ctx.font = "bold 13px Arial";
          ctx.textAlign = "center";
          ctx.fillText("a = " + a.toFixed(1), tx(a), 16);
          ctx.fillStyle = "#2e7d32";
          ctx.fillText("b = " + b.toFixed(1), tx(b), 16);

          ctx.fillStyle = "#1565C0";
          ctx.font = "bold italic 14px Arial";
          ctx.textAlign = "left";
          ctx.fillText("f(x) = " + self.funcStr, 10, 30);

          ctx.fillStyle = "#333";
          ctx.font = "bold 14px Arial";
          ctx.textAlign = "right";
          ctx.fillText("x", W - 5, yMin <= 0 && yMax >= 0 ? ty(0) - 5 : H - 20);
          ctx.textAlign = "left";
          ctx.fillText("y", xMin <= 0 && xMax >= 0 ? tx(0) + 5 : 5, 14);

          // Update info
          this.updateInfo(rectAreas, dx, sign);
        },

        updateInfo: function (rectAreas, dx, sign) {
          var a = this.params.a,
            b = this.params.b,
            n = this.params.n;
          var self = this;
          var aEff = Math.min(a, b),
            bEff = Math.max(a, b);
          var N = 4000,
            h = (bEff - aEff) / N,
            simpson = 0;
          for (var i = 0; i <= N; i++) {
            var x = aEff + i * h;
            var y = self.f(x);
            var yv = isFinite(y) ? y : 0;
            simpson += yv * (i === 0 || i === N ? 1 : i % 2 === 1 ? 4 : 2);
          }
          var exact = ((simpson * h) / 3) * sign;
          var approx = 0;
          for (var i = 0; i < rectAreas.length; i++) approx += rectAreas[i];

          document.getElementById("l2-exact").textContent = isFinite(exact)
            ? exact.toFixed(4)
            : "N/A";
          document.getElementById("l2-approx").textContent = isFinite(approx)
            ? approx.toFixed(4)
            : "N/A";
          document.getElementById("l2-error").textContent =
            isFinite(exact) && isFinite(approx)
              ? Math.abs(exact - approx).toFixed(4)
              : "N/A";

          var listEl = document.getElementById("l2-rect-list");
          if (rectAreas.length <= 50) {
            var vals = [];
            for (var i = 0; i < rectAreas.length; i++)
              vals.push(isFinite(rectAreas[i]) ? rectAreas[i].toFixed(2) : "?");
            listEl.textContent = "{" + vals.join(", ") + "}";
          } else {
            var first = [],
              last = [];
            for (var i = 0; i < 10; i++) first.push(rectAreas[i].toFixed(2));
            for (var i = rectAreas.length - 5; i < rectAreas.length; i++)
              last.push(rectAreas[i].toFixed(2));
            listEl.textContent =
              "{" +
              first.join(", ") +
              ", ..., " +
              last.join(", ") +
              "} (" +
              rectAreas.length +
              " values)";
          }
        },
      };

      // Window resize
      window.addEventListener("resize", function () {
        if (currentLesson === 1) L1.onResize();
        else if (currentLesson === 2 && L2.initialized) L2.draw();
      });
