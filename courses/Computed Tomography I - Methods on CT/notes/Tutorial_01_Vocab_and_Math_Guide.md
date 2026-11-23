# CT 1: Math & Vocabulary Primer for Medical Imaging
**Course:** Computed Tomography I – Methods on CT (OVGU Magdeburg)  
**Target:** Tutorial 1 Mathematical Refresher  
**Core Goal:** Bridge the gap between abstract functional analysis and CT imaging physics.

---

## 1. The Big Picture: Why This Math Matters in CT

In Computed Tomography, the fundamental task is an **inverse problem**:
$$\text{Image } f(x,y) \xrightarrow{\text{Scanner Physics } (\mathcal{A})} \text{Detector Data } g(\theta, s) \xrightarrow{\text{Reconstruction } (\mathcal{A}^{-1} \text{ or } \mathcal{A}^*)} \text{Reconstructed Slice } \hat{f}(x,y)$$

* **$f(x,y)$**: Unknown 2D cross-sectional slice of the patient (linear attenuation coefficient $\mu(x,y)$ in $\text{mm}^{-1}$).
* **$\mathcal{A}$ (Operator)**: The CT scanner forward projection (Radon transform $\mathcal{R}$), collecting X-ray line integrals.
* **$g(\theta, s)$**: The measured sinogram (detector readings at projection angle $\theta$ and detector position $s$).
* **Fourier & Convolution**: The analytical tools used to invert $\mathcal{A}$ in real time (Filtered Backprojection, FBP).

---

## 2. Terminology & Vocabulary Breakdown

| Term / Notation | Literal Reading | Plain-English Meaning | CT Engineering Meaning |
| :--- | :--- | :--- | :--- |
| **$f: [a,b] \to \mathbb{R}$** | Function from interval $[a,b]$ to real numbers | Takes a position $x$ between $a$ and $b$, returns a real number | 1D profile of an X-ray detector or tissue density across a line. |
| **Operator ($\mathcal{A}$)** | Mapping from function to function | An operation that eats an entire function $f$ and outputs a new function $g$ | The CT hardware/geometry: eats patient slice $f$, outputs sinogram $g$. |
| **Linearity** | Superposition principle | $\mathcal{A}[\alpha f_1 + \beta f_2] = \alpha \mathcal{A}[f_1] + \beta \mathcal{A}[f_2]$ | Scanning two objects together equals the sum of scanning them individually. |
| **Inner Product $\langle f, g \rangle$** | Continuous dot product | Multiplies two functions and integrates their overlap | Measures similarity between two signals or projection profiles. |
| **Complex Conjugate ($\overline{z}$)** | Negate the imaginary part | If $z = u + iv$, $\overline{z} = u - iv$ | Ensures that length/energy $\langle f, f \rangle$ is always a positive real number. |
| **$L^2[a,b]$ Space** | Square-integrable space | The collection of all functions whose squared area $\int \|f\|^2 dx < \infty$ is finite | Real physical signals (finite total energy/dose). |
| **2-Norm ($\|f\|_2$)** | Function length / magnitude | $\sqrt{\langle f, f \rangle} = \left(\int |f(x)|^2 dx\right)^{1/2}$ | Total signal power or root-mean-square error (RMSE) in reconstruction. |
| **Adjoint Operator ($\mathcal{A}^*$)** | Transpose of an operator | $\langle \mathcal{A}f, g \rangle = \langle f, \mathcal{A}^* g \rangle$ | **Unfiltered Backprojection**: smearing measured sinogram lines back across the pixel grid. |
| **Spatial Frequency ($\nu$)** | Cycles per unit distance | Number of oscillations per millimeter ($\text{mm}^{-1}$) | Detail scale: Low $\nu$ = soft tissue contrast; High $\nu$ = micro-calcifications, bone trabeculae, edge sharpness. |
| **Dirac Delta ($\delta(x)$)** | Unit impulse | Infinitely thin spike at $x=0$, zero elsewhere, total area $= 1$ | An idealized point-object (pinhole / point-spread function input). |
| **Convolution ($f * g$)** | Slide, multiply, integrate | Moving average / blurring of $f$ by a response kernel $g$ | Filtering sinograms or blurring caused by detector element width / focal spot. |
| **Convolution Theorem** | Duality | $\mathcal{F}[f * g] = \mathcal{F}[f] \cdot \mathcal{F}[g]$ | Replaces expensive spatial convolution with simple multiplication in frequency space. |

---

## 3. Deep Dive: Concepts Explained

### 3.1 What is an "Operator"? (Function vs. Operator)
* A **function** takes a *number* and gives a *number*:
  $$x \in \mathbb{R} \xrightarrow{f} f(x) \in \mathbb{R}$$
  *(e.g., coordinate $x = 5 \text{ mm} \implies \mu = 0.02 \text{ mm}^{-1}$)*
* An **operator** takes an *entire function* and transforms it into *another function*:
  $$f(x) \xrightarrow{\mathcal{A}} g(x) \quad \text{or} \quad \mathcal{A}[f] = g$$
* **Matrix Analogy:**
  * In finite discrete algebra: a vector $\mathbf{x} \in \mathbb{R}^N$ is transformed by a matrix $\mathbf{A} \in \mathbb{R}^{M \times N}$ into $\mathbf{y} = \mathbf{A}\mathbf{x}$.
  * In continuous math: the image function $f$ is transformed by operator $\mathcal{A}$ into projection function $g$. $\mathcal{A}$ is simply a continuous matrix.

---

### 3.2 Inner Product & $L^2$ Space: The Continuous Vector Dot Product
In introductory linear algebra with vectors $\mathbf{u}, \mathbf{v} \in \mathbb{R}^N$:
$$\mathbf{u} \cdot \mathbf{v} = \sum_{i=1}^N u_i v_i, \quad \|\mathbf{u}\|_2 = \sqrt{\sum_{i=1}^N u_i^2}$$

In function space, indices $i \in \{1, \dots, N\}$ become continuous coordinates $x \in [a, b]$. The summation $\sum$ becomes an integral $\int$:
$$\langle f, g \rangle = \int_a^b f(x) g(x) \, dx$$

#### Why the Complex Conjugate $\overline{g(x)}$?
If functions are complex-valued (e.g. Fourier domain signals $e^{i 2\pi \nu x}$):
$$\langle f, g \rangle = \int_a^b f(x) \overline{g(x)} \, dx$$
Without $\overline{g(x)}$, the length of a function $f(x) = i$ would be $\int i \cdot i \, dx = -1$ (a negative squared length!). With the conjugate:
$$\langle f, f \rangle = \int f(x) \overline{f(x)} \, dx = \int |f(x)|^2 \, dx \ge 0$$
This guarantees that norm and distance are strictly real and non-negative.

#### What does "$L^2$" stand for?
* **$L$**: Named after Henri Lebesgue (Lebesgue integration).
* **$2$**: Exponent 2 (square).
* $f \in L^2[a,b]$ simply means the signal does not blow up to infinite energy:
  $$\int_a^b |f(x)|^2 \, dx < \infty$$

---

### 3.3 The Adjoint Operator ($\mathcal{A}^*$): Matrix Transpose vs. Inverse

In discrete linear algebra:
* Forward model: $\mathbf{g} = \mathbf{A}\mathbf{f}$
* Transpose: $\mathbf{A}^T$ satisfies $(\mathbf{A}\mathbf{f})^T \mathbf{g} = \mathbf{f}^T (\mathbf{A}^T \mathbf{g}) \implies \langle \mathbf{A}\mathbf{f}, \mathbf{g} \rangle = \langle \mathbf{f}, \mathbf{A}^T \mathbf{g} \rangle$.
* Inverse: $\mathbf{A}^{-1}$ satisfies $\mathbf{A}^{-1}\mathbf{A} = \mathbf{I}$.

In CT:
* **Forward Projection ($\mathcal{R}$):** Takes 2D slice $f(x,y)$, computes ray sums along lines $L(\theta, s)$ to create sinogram $g(\theta, s)$.
* **Adjoint ($\mathcal{R}^*$ = Backprojection):** Takes sinogram $g(\theta, s)$, smears values back across all pixels lying along the line $L(\theta, s)$.
* **The Trap:** **$\mathcal{R}^* \neq \mathcal{R}^{-1}$!**
  * Smearing rays back over the image accumulates overlapping ray intersections, creating a heavy $1/r$ blur.
  * To obtain the true inverse $\mathcal{R}^{-1}$, one must **filter** before backprojecting:
    $$\mathcal{R}^{-1} = \mathcal{R}^* \circ \mathcal{K}_{\text{ramp}} \quad \text{(Filtered Backprojection)}$$

---

### 3.4 Fourier Transform: The Prism of Spatial Signals

$$\tilde{f}(\nu) = \int_{-\infty}^{\infty} f(x) e^{-i 2\pi \nu x} \, dx$$

#### What is $e^{-i 2\pi \nu x}$?
By Euler’s formula:
$$e^{-i 2\pi \nu x} = \cos(2\pi \nu x) - i \sin(2\pi \nu x)$$
The Fourier integral simply calculates the inner product of your image profile $f(x)$ with cosine and sine waves of spatial frequency $\nu$:
* Real part of $\tilde{f}(\nu)$: overlap of $f(x)$ with $\cos(2\pi \nu x)$ (even components).
* Imaginary part of $\tilde{f}(\nu)$: overlap of $f(x)$ with $-\sin(2\pi \nu x)$ (odd components).

#### Spatial Frequency ($\nu$) vs. Temporal Frequency ($f$):
* **Temporal:** Cycles per second ($\text{s}^{-1} = \text{Hz}$). How fast a sound wave oscillates over time.
* **Spatial:** Cycles per millimeter ($\text{mm}^{-1}$). How fast tissue density changes across space.
  * Low spatial frequency (e.g. $0.05 \text{ mm}^{-1} \implies \lambda = 20 \text{ mm}$): large uniform liver or brain parenchyma.
  * High spatial frequency (e.g. $2 \text{ mm}^{-1} \implies \lambda = 0.5 \text{ mm}$): trabecular bone structure, sharp organ boundaries, fine vascular walls.

#### Why is $\nu \ge 0$ sufficient for physical objects?
Because real human bodies have real, non-complex attenuation coefficients ($f(x) \in \mathbb{R}$):
$$\tilde{f}(-\nu) = \overline{\tilde{f}(\nu)}$$
* $|\tilde{f}(-\nu)| = |\tilde{f}(\nu)|$ (Magnitude is mirror-symmetric).
* Phase at $-\nu$ is just the negative of phase at $+\nu$.
* Negative frequencies provide zero new information; storing $[0, \nu_{\max}]$ is sufficient.

#### Scaling Reciprocity: $g(x) = f(ax) \implies \tilde{g}(\nu) = \frac{1}{|a|} \tilde{f}(\nu/a)$
* If $a = 2$: $g(x) = f(2x)$ shrinks the object spatially by $50\%$ (makes it twice as narrow).
* In Fourier domain: $\tilde{g}(\nu) = \frac{1}{2}\tilde{f}(\nu/2)$ stretches the frequency spectrum to double its width!
* **Engineering rule in CT:** Smaller features in the patient require wider frequency bandwidth, translating to smaller detector pixel size and higher sampling rates.

---

### 3.5 Convolution ($f * g$) & Filtering

$$(f * g)(x) = \int_{-\infty}^{\infty} f(t) g(x - t) \, dt$$

#### Step-by-Step Physical Intuition:
1. **$g(-t)$**: Flip the filter kernel horizontally.
2. **$g(x - t)$**: Shift the kernel by offset $x$.
3. **$\int f(t) g(x-t) dt$**: Multiply patient signal with kernel and compute the area under the curve.
4. Result: A smoothed, edge-enhanced, or modified copy of $f(x)$.

#### The Convolution Theorem:
$$\mathcal{F}[f * g](\nu) = \tilde{f}(\nu) \cdot \tilde{g}(\nu)$$
* Spatial convolution is mathematically equivalent to pointwise multiplication in the Fourier domain.
* **Why CT uses this:**
  * Unfiltered backprojection suffers from $\frac{1}{|\nu|}$ blurring.
  * To fix it, we must multiply the frequency spectrum of each projection by $|\nu|$ (the Ramp filter).
  * Rather than computing 2D Fourier transforms of entire images, we convert $|\nu|$ to its spatial impulse response $h(s)$ (the Ram-Lak kernel) and convolve each 1D detector profile directly:
    $$p_{\text{filtered}}(\theta, s) = (p * h)(s)$$
  * This enables instantaneous pipeline processing while the gantry is still rotating.

---

## 4. Quick Summary Checklist

When reviewing Tutorial 1 exercises, remember:
1. **Operator:** Machine or equation transforming a continuous function into another function.
2. **Linear:** Double input $\implies$ double output; scan $A+B \implies$ scan $A$ + scan $B$.
3. **$L^2$ Norm:** Continuous Root-Mean-Square (RMS) signal energy.
4. **Adjoint ($\mathcal{A}^*$):** Backprojection (smearing), not the inverse.
5. **Real-Valued Signals:** Mirror-symmetric Fourier spectrum ($\tilde{f}(-\nu) = \overline{\tilde{f}(\nu)}$).
6. **Convolution Theorem:** Convolution in detector space = filtering in frequency space.
