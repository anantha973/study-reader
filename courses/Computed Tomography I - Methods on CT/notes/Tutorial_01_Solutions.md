# Tutorial 1: The Mathematics of Computed Tomography (Part I)
**Course:** Computed Tomography I – Methods on CT (OVGU Magdeburg)  
**Instructor:** Dr. rer. medic. Martin Volk (`martin.volk@med.ovgu.de`)  
**Reference:** Hansen, Jørgensen, Lionheart: *Computed Tomography: Algorithms, Insight, and Just Enough Theory*, SIAM 2021.

---

## 1.1 Functions and Operators

### (i) Linearity of an Operator
* **Definition:** An operator $\mathcal{A}: \mathcal{X} \to \mathcal{Y}$ is linear if it satisfies the superposition principle (additivity and homogeneity):
  $$\mathcal{A}[\alpha f_1 + \beta f_2] = \alpha \mathcal{A}[f_1] + \beta \mathcal{A}[f_2] \quad \forall f_1, f_2 \in \mathcal{X}, \; \forall \alpha, \beta \in \mathbb{C} \text{ (or } \mathbb{R}\text{)}$$
* **Examples in CT / Math:**
  1. **Radon Transform ($\mathcal{R}$):** The continuous line-integral projection operator:
     $$\mathcal{R}[f](\theta, s) = \int_{L(\theta, s)} f(\mathbf{x}) \, dl$$
  2. **Derivative Operator ($\mathcal{D} = \frac{d}{dx}$):** Used directly in differential filter implementations (e.g. ramp filtering $\frac{d}{ds} \mathcal{H}[p]$).

---

### (ii) Inner Product and $L^2$ Norm
* **Inner Product:** For two functions $f, g \in L^2[a, b]$:
  $$\langle f, g \rangle = \int_a^b f(x) \overline{g(x)} \, dx \quad (\text{for real functions: } \int_a^b f(x) g(x) \, dx)$$
* **$L^2$-Norm:** The 2-norm induced by this inner product:
  $$\|f\|_{L^2} = \sqrt{\langle f, f \rangle} = \left( \int_a^b |f(x)|^2 \, dx \right)^{1/2}$$

---

### (iii) Adjoint Operator ($\mathcal{A}^*$)
* **Definition:** Given Hilbert spaces $(\mathcal{X}, \langle \cdot, \cdot \rangle_\mathcal{X})$ and $(\mathcal{Y}, \langle \cdot, \cdot \rangle_\mathcal{Y})$, the adjoint $\mathcal{A}^*: \mathcal{Y} \to \mathcal{X}$ of $\mathcal{A}: \mathcal{X} \to \mathcal{Y}$ satisfies:
  $$\langle \mathcal{A}f, g \rangle_\mathcal{Y} = \langle f, \mathcal{A}^* g \rangle_\mathcal{X} \quad \forall f \in \mathcal{X}, \; g \in \mathcal{Y}$$
* **CT Relevance:** In tomography, if $\mathcal{A} = \mathcal{R}$ is the forward projection (Radon transform), its adjoint $\mathcal{A}^* = \mathcal{R}^*$ is the **unfiltered backprojection operator**:
  $$\mathcal{R}^*[p](\mathbf{x}) = \int_0^\pi p(\theta, \mathbf{x} \cdot \boldsymbol{\theta}) \, d\theta$$
  Note that $\mathcal{R}^* \neq \mathcal{R}^{-1}$; rather, $\mathcal{R}^* \mathcal{R} f = f * \frac{1}{\|\mathbf{x}\|}$.

---

## 1.2 Fourier Transform

### (i) 1D Fourier Transform & Physical Interpretation
* **Forward Transform:**
  $$\tilde{f}(\nu) = \mathcal{F}[f](\nu) = \int_{-\infty}^{\infty} f(x) e^{-i 2\pi \nu x} \, dx$$
* **Inverse Transform:**
  $$f(x) = \mathcal{F}^{-1}[\tilde{f}](x) = \int_{-\infty}^{\infty} \tilde{f}(\nu) e^{i 2\pi \nu x} \, d\nu$$
* **Interpretation:** Decomposes the spatial object attenuation profile $f(x)$ into orthogonal harmonic basis functions (spatial frequencies $\nu$, unit: $\text{mm}^{-1}$).
  * Magnitude $|\tilde{f}(\nu)|$: Spectral energy at spatial resolution scale $1/\nu$ (low $\nu$ = coarse structure/contrast; high $\nu$ = fine edges/noise).
  * Phase $\angle \tilde{f}(\nu)$: Structural spatial positions and alignments.

---

### (ii) Linearity of the Fourier Transform
* **Proof:**
  $$\mathcal{F}[\alpha f_1 + \beta f_2](\nu) = \int_{-\infty}^{\infty} (\alpha f_1(x) + \beta f_2(x)) e^{-i 2\pi \nu x} dx = \alpha \tilde{f}_1(\nu) + \beta \tilde{f}_2(\nu)$$
  Hence, $\mathcal{F}$ is a linear operator.

---

### (iii) Sufficiency of $\nu \ge 0$ (Hermitian Symmetry)
* **Condition:** $f(x)$ is real-valued ($f(x) \in \mathbb{R}$).
* **Derivation:**
  $$\tilde{f}(-\nu) = \int_{-\infty}^{\infty} f(x) e^{-i 2\pi (-\nu) x} dx = \int_{-\infty}^{\infty} f(x) \overline{e^{-i 2\pi \nu x}} dx = \overline{\int_{-\infty}^{\infty} f(x) e^{-i 2\pi \nu x} dx} = \overline{\tilde{f}(\nu)}$$
* **Consequence:**
  * $|\tilde{f}(-\nu)| = |\tilde{f}(\nu)|$ (Even magnitude)
  * $\angle \tilde{f}(-\nu) = -\angle \tilde{f}(\nu)$ (Odd phase)
  Negative frequencies contain strictly redundant information.

---

### (iv) Scaling Property & Reciprocity
* **Proof for $g(x) = f(ax)$ ($a \neq 0$):**
  $$\tilde{g}(\nu) = \int_{-\infty}^{\infty} f(ax) e^{-i 2\pi \nu x} \, dx$$
  Substitute $u = ax \implies x = u/a$, $dx = du/a$:
  * For $a > 0$: limits $[-\infty, \infty] \implies \frac{1}{a} \int_{-\infty}^{\infty} f(u) e^{-i 2\pi (\nu/a) u} du = \frac{1}{a} \tilde{f}\left(\frac{\nu}{a}\right)$.
  * For $a < 0$: limits $[\infty, -\infty] \implies -\frac{1}{a} \int_{-\infty}^{\infty} f(u) e^{-i 2\pi (\nu/a) u} du = \frac{1}{|a|} \tilde{f}\left(\frac{\nu}{a}\right)$.
  $$\therefore \tilde{g}(\nu) = \frac{1}{|a|} \tilde{f}\left(\frac{\nu}{a}\right)$$
* **Physical Implication (Heisenberg/Gabor Uncertainty):**
  * Spatially stretching an object ($|a| < 1$, broader in space) compresses its spectrum ($1/|a| > 1$, narrower in frequency domain).
  * Sharp spatial transitions/narrow structures ($|a| > 1$) demand wide spectral bandwidth in CT detector sampling.

---

### (v) Specific Fourier Transforms

#### 1. Exponential Decay $f(x) = e^{-a|x|}, \; a > 0$
$$\tilde{f}(\nu) = \int_{-\infty}^0 e^{(a - i 2\pi \nu)x} dx + \int_0^{\infty} e^{-(a + i 2\pi \nu)x} dx$$
$$\tilde{f}(\nu) = \left[ \frac{e^{(a - i 2\pi \nu)x}}{a - i 2\pi \nu} \right]_{-\infty}^0 + \left[ \frac{e^{-(a + i 2\pi \nu)x}}{-(a + i 2\pi \nu)} \right]_0^{\infty} = \frac{1}{a - i 2\pi \nu} + \frac{1}{a + i 2\pi \nu}$$
$$\tilde{f}(\nu) = \frac{2a}{a^2 + 4\pi^2 \nu^2} \quad (\text{Lorentzian spectrum})$$

#### 2. Dirac Delta Function $\delta(x)$
$$\mathcal{F}[\delta](\nu) = \int_{-\infty}^{\infty} \delta(x) e^{-i 2\pi \nu x} \, dx = e^{-i 2\pi \nu (0)} = 1 \quad (\text{White spectrum / impulse response})$$

---

### (vi) 2D Fourier Transform
* **Forward:**
  $$\tilde{f}(\nu_x, \nu_y) = \int_{-\infty}^{\infty} \int_{-\infty}^{\infty} f(x, y) e^{-i 2\pi (\nu_x x + \nu_y y)} \, dx \, dy$$
* **Inverse:**
  $$f(x, y) = \int_{-\infty}^{\infty} \int_{-\infty}^{\infty} \tilde{f}(\nu_x, \nu_y) e^{i 2\pi (\nu_x x + \nu_y y)} \, d\nu_x \, d\nu_y$$
* **Significance in CT:** Foundational to the **Fourier Slice Theorem (Central Slice Theorem)**:
  $$\mathcal{F}_{1D}\{\mathcal{R}[f](\theta, \cdot)\}(\nu) = \mathcal{F}_{2D}\{f\}(\nu \cos\theta, \nu \sin\theta)$$

---

## 1.3 Convolution

### (i) Definition
$$(f * g)(x) = \int_{-\infty}^{\infty} f(t) g(x - t) \, dt = \int_{-\infty}^{\infty} f(x - t) g(t) \, dt$$

---

### (ii) Convolution Theorem & Filtering in CT
* **Theorem:** $\mathcal{F}[f * g](\nu) = \tilde{f}(\nu) \cdot \tilde{g}(\nu)$
* **Proof:**
  $$\mathcal{F}[f * g](\nu) = \int_{-\infty}^{\infty} \left( \int_{-\infty}^{\infty} f(t) g(x - t) dt \right) e^{-i 2\pi \nu x} dx$$
  Substitute $u = x - t \implies x = u + t$, $dx = du$:
  $$= \int_{-\infty}^{\infty} f(t) e^{-i 2\pi \nu t} \left( \int_{-\infty}^{\infty} g(u) e^{-i 2\pi \nu u} du \right) dt = \tilde{f}(\nu) \cdot \tilde{g}(\nu) \quad \blacksquare$$
* **Filtering Explanation & CT Application:**
  * Spatial convolution equals frequency-domain point-wise multiplication (filtering).
  * In CT reconstruction (Filtered Backprojection / FBP), the backprojection operator introduces a $1/r$ blur ($\sim 1/|\nu|$ in frequency space).
  * To invert this blur, projections must be filtered by the **ramp filter** $| \nu |$. By the convolution theorem, this frequency multiplication can be executed as a spatial 1D convolution with the Ram-Lak kernel $h(s)$:
    $$p_{\text{filtered}}(\theta, s) = (p * h)(s)$$
    enabling streamable, projection-by-projection reconstruction without 2D matrix inversions.
