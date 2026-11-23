# Tutorial 2: Inverse Problems, Numerical Integration & Linear Algebra in CT
**Course:** Computed Tomography I – Methods on CT (OVGU Magdeburg)  
**Instructors:** Dr. rer. medic. Martin Volk, M.Sc. Julius Kley  
**Primary Reference:** Hansen, Jørgensen, Lionheart: *Computed Tomography: Algorithms, Insight, and Just Enough Theory*, SIAM 2021.

---

## Section 1: The Inverse Problem

### 1.1 Boundedness of a Linear Operator

#### Intuition & Basics (Simple Words)
* **What is an operator?** A machine or mathematical mapping that takes an entire function/image $f$ and outputs a new function/data $g$ (written as $\mathcal{A}[f] = g$). In CT, $\mathcal{A}$ is the scanner: you put a patient cross-section $f(x, y)$ in, and the detector outputs sinogram data $g(\theta, s)$.
* **What does "bounded" mean?** Finite input $\implies$ finite output. The system has finite amplification (or "gain"). A person with realistic, finite tissue densities cannot produce infinite X-ray detector readings.
* **Why does boundedness matter for the forward model ($\mathcal{A}$)?** Physical realism and stability. Physical X-ray attenuation obeys the Beer-Lambert law; integrating finite tissue densities over a finite patient thickness always yields a finite line integral. An unbounded forward operator would mean a safe, finite dose could theoretically blow up to infinity at the detector, which is physically impossible.
* **Why doesn't forward boundedness guarantee a stable inverse ($\mathcal{A}^{-1}$)?**
  * The forward projection $\mathcal{A}$ is an **integration** process (smoothing). Integration dampens high-frequency ripples.
  * Inversion $\mathcal{A}^{-1}$ is a **differentiation** process (sharpening / ramp filtering). Differentiation amplifies high-frequency variations.
  * If the detector measurement has even microscopic measurement noise $\epsilon$ at high spatial frequencies, the forward operator $\mathcal{A}$ could map that tiny fluctuation from an enormous perturbation in image space. Inverting it ($\mathcal{A}^{-1}[\epsilon]$) multiplies those high frequencies by arbitrarily large values, blowing up the reconstructed image.

#### Standard Academic Definition
> **Definition (Bounded Linear Operator):**  
> Let $\mathcal{X}$ and $\mathcal{Y}$ be normed vector spaces. A linear operator $\mathcal{A}: \mathcal{X} \to \mathcal{Y}$ is **bounded** if there exists a constant $M \ge 0$ such that:
> $$\|\mathcal{A} f\|_\mathcal{Y} \le M \|f\|_\mathcal{X} \quad \forall f \in \mathcal{X}$$
> The operator norm is defined as:
> $$\|\mathcal{A}\| = \sup_{f \in \mathcal{X}, f \neq 0} \frac{\|\mathcal{A} f\|_\mathcal{Y}}{\|f\|_\mathcal{X}} = \sup_{\|f\|_\mathcal{X} \le 1} \|\mathcal{A} f\|_\mathcal{Y}$$
> A linear operator on a normed space is bounded if and only if it is **continuous**.

> **Standard Explanation (Forward vs. Inverse Stability):**  
> Forward model boundedness guarantees $\|\mathcal{A}\| < \infty$, ensuring continuous and stable forward mapping. However, the inverse operator $\mathcal{A}^{-1}: \operatorname{Ran}(\mathcal{A}) \subseteq \mathcal{Y} \to \mathcal{X}$ may be **unbounded** ($\|\mathcal{A}^{-1}\| = \infty$). In infinite-dimensional function spaces (such as the Radon transform), $\mathcal{A}$ is a compact smoothing operator. By the Riemann-Lebesgue lemma and the Fredholm alternative, the inverse of an infinite-dimensional compact operator with infinite-dimensional range is unbounded, meaning $\mathcal{A}^{-1}$ is discontinuous and violates Hadamard stability.

---

### 1.2 Well-Posed vs. Ill-Posed Problems (Hadamard Conditions)

#### Intuition & Basics (Simple Words)
In 1902, French mathematician Jacques Hadamard stated that a mathematical model of a physical process is "well-behaved" (well-posed) only if it makes sense in the real world:
1. **Existence:** Can we find an image that explains the measurements?
2. **Uniqueness:** Is there only *one* true image, or could multiple different internal organs produce identical detector readings?
3. **Stability:** Does a tiny speck of electronic noise on the detector corrupt the entire image into garbage?

If any of these three conditions is broken, the problem is **ill-posed**. CT reconstruction is fundamentally ill-posed due to instability (Condition 3) and, in cases like limited-angle scanning, non-uniqueness (Condition 2).

#### Standard Academic Definition: Hadamard's Criteria
> An inverse problem $\mathcal{A} f = g$ is **well-posed** in the sense of Hadamard if:
> 1. **Existence:** For every $g \in \mathcal{Y}$, there exists at least one $f \in \mathcal{X}$ such that $\mathcal{A} f = g$.
> 2. **Uniqueness:** For every $g \in \mathcal{Y}$, there is at most one $f \in \mathcal{X}$ such that $\mathcal{A} f = g$.
> 3. **Stability:** The solution $f$ depends continuously on the data $g$. That is, if $g_k \to g$, then $\mathcal{A}^{-1} g_k \to \mathcal{A}^{-1} g$ in their respective norms.
>
> If any condition fails, the problem is **ill-posed**.

#### Connection to Operator Spaces
* **Range of the Operator ($\operatorname{Ran}(\mathcal{A})$):**
  * $\operatorname{Ran}(\mathcal{A}) = \{ g \in \mathcal{Y} \mid \exists f \in \mathcal{X} \text{ such that } \mathcal{A} f = g \}$.
  * **Link to Existence:** If real-world measured data $g^\delta = g_{\text{exact}} + e$ contains noise $e$, $g^\delta$ typically lies outside the range ($\operatorname{Ran}(\mathcal{A}) \subsetneq \mathcal{Y}$). Then **no exact solution exists**.
* **Nullspace (Kernel) of the Operator ($\operatorname{Null}(\mathcal{A})$ or $\ker(\mathcal{A})$):**
  * $\operatorname{Null}(\mathcal{A}) = \{ f \in \mathcal{X} \mid \mathcal{A} f = 0 \}$.
  * **Link to Uniqueness:** Uniqueness holds if and only if $\operatorname{Null}(\mathcal{A}) = \{0\}$. If there exists a non-zero $f_0 \in \operatorname{Null}(\mathcal{A})$, then if $f$ is a solution, $f + c f_0$ is also an identical solution for any scalar $c$. In CT, such invisible structures are called "ghosts" (common when view angles are missing).
* **Boundedness of the Inverse ($\|\mathcal{A}^{-1}\| < \infty$):**
  * **Link to Stability:** Continuous dependence requires the inverse mapping $\mathcal{A}^{-1}$ to be bounded. If $\|\mathcal{A}^{-1}\| = \infty$, the condition number is infinite; an arbitrarily small measurement perturbation $\|e\|_\mathcal{Y} \to 0$ can produce an arbitrarily large reconstruction error $\|\mathcal{A}^{-1} e\|_\mathcal{X} \to \infty$.

---

## Section 2: Definite Integrals and Discretization

### Why Riemann Sums in CT?
X-ray transmission obeys Beer-Lambert's law:
$$I = I_0 \exp\left( - \int_L \mu(x,y) \, dl \right) \implies p = \ln\left(\frac{I_0}{I}\right) = \int_L \mu(x,y) \, dl$$
The scanner measures continuous line integrals $p$. However, digital computers only store discrete arrays of numbers (pixels). To simulate forward projection or perform reconstruction, computers approximate continuous line integrals by discrete summations over pixels:
$$p_i \approx \sum_{j=1}^n a_{ij} u_j$$
This discretization is mathematically a **Riemann sum**.

---

### 2.1 Visualizing Riemann Sum Approximations

#### Part (a): $f(x) = 2x$ on interval $[0, 3]$
* **Exact Integral:**
  $$\int_0^3 2x \, dx = \left[ x^2 \right]_0^3 = 3^2 - 0^2 = 9$$
* **Left Endpoint Rule Formulation:**
  For $n$ subintervals, step size is $\Delta x = \frac{3 - 0}{n} = \frac{3}{n}$.  
  Sample points: $t_i = x_{i-1} = (i-1)\Delta x$ for $i = 1, \dots, n$.
  $$R_n = \sum_{i=1}^n 2 t_i \Delta x = 2 \Delta x^2 \sum_{k=0}^{n-1} k = 2 \left(\frac{3}{n}\right)^2 \frac{(n-1)n}{2} = 9 \cdot \frac{n-1}{n} = 9\left(1 - \frac{1}{n}\right)$$
* **Numerical Evaluations:**
  * For $n = 5$: $\Delta x = 0.6$
    $$R_5 = 9 \left(1 - \frac{1}{5}\right) = 9 \times 0.8 = 7.2 \quad (\text{Error} = 9 - 7.2 = 1.8)$$
  * For $n = 10$: $\Delta x = 0.3$
    $$R_{10} = 9 \left(1 - \frac{1}{10}\right) = 9 \times 0.9 = 8.1 \quad (\text{Error} = 9 - 8.1 = 0.9)$$
  * For $n = 1000$: $\Delta x = 0.003$
    $$R_{1000} = 9 \left(1 - \frac{1}{1000}\right) = 9 \times 0.999 = 8.991 \quad (\text{Error} = 0.009)$$
  * **Asymptotic Limit:** $\lim_{n \to \infty} R_n = 9$. Because $f(x) = 2x$ is strictly increasing, the left endpoint sum is a strict lower bound that monotonically converges to 9.

#### Part (b): $f(x) = x^2$ on interval $[0, 4]$
* **Exact Integral:**
  $$\int_0^4 x^2 \, dx = \left[ \frac{x^3}{3} \right]_0^4 = \frac{4^3}{3} - 0 = \frac{64}{3} \approx 21.333333$$
* **Left Endpoint Rule Formulation:**
  $\Delta x = \frac{4 - 0}{n} = \frac{4}{n}$. Sample points: $t_i = (i-1)\Delta x$.
  $$R_n = \sum_{i=1}^n \left((i-1)\Delta x\right)^2 \Delta x = \Delta x^3 \sum_{k=0}^{n-1} k^2 = \left(\frac{4}{n}\right)^3 \frac{(n-1)n(2n-1)}{6} = \frac{64}{3} \cdot \frac{(n-1)(2n-1)}{2n^2}$$
* **Numerical Evaluations:**
  * For $n = 5$: $\Delta x = 0.8$
    Sample points: $\{0, 0.8, 1.6, 2.4, 3.2\}$.  
    Values $t_i^2$: $\{0, 0.64, 2.56, 5.76, 10.24\}$. Sum $= 19.2$.  
    $$R_5 = 19.2 \times 0.8 = 15.36 \quad (\text{Error} = 21.3333 - 15.36 = 5.9733)$$
  * For $n = 10$: $\Delta x = 0.4$
    $$R_{10} = \frac{64}{3} \cdot \frac{9 \times 19}{200} = 21.3333 \times 0.855 = 18.24 \quad (\text{Error} = 3.0933)$$
  * For $n = 1000$: $\Delta x = 0.004$
    $$R_{1000} = 21.301344 \quad (\text{Error} = 0.031989)$$
  * **Convergence Observation:** The error scales as $\mathcal{O}(\Delta x) = \mathcal{O}(1/n)$, confirming first-order convergence.

---

### 2.2 The Midpoint Rule

#### Problem Statement
Estimate $\int_0^2 x^2 \, dx$ using the midpoint rule with $n = 4$ subintervals. Compare with the exact value and analyze accuracy.

#### Step-by-Step Calculation
1. **Subinterval Width:**
   $$\Delta x = \frac{b - a}{n} = \frac{2 - 0}{4} = 0.5$$
2. **Subintervals:**
   $$[0, 0.5], \quad [0.5, 1.0], \quad [1.0, 1.5], \quad [1.5, 2.0]$$
3. **Midpoints $t_i = a + \left(i - \frac{1}{2}\right)\Delta x$:**
   * $t_1 = 0 + 0.5 \times 0.5 = 0.25 = \frac{1}{4}$
   * $t_2 = 0 + 1.5 \times 0.5 = 0.75 = \frac{3}{4}$
   * $t_3 = 0 + 2.5 \times 0.5 = 1.25 = \frac{5}{4}$
   * $t_4 = 0 + 3.5 \times 0.5 = 1.75 = \frac{7}{4}$
4. **Function Evaluations $f(t_i) = t_i^2$:**
   * $f(t_1) = (0.25)^2 = 0.0625 = \frac{1}{16}$
   * $f(t_2) = (0.75)^2 = 0.5625 = \frac{9}{16}$
   * $f(t_3) = (1.25)^2 = 1.5625 = \frac{25}{16}$
   * $f(t_4) = (1.75)^2 = 3.0625 = \frac{49}{16}$
5. **Midpoint Approximation $Q_4$:**
   $$Q_4 = \sum_{i=1}^4 f(t_i) \Delta x = \left( \frac{1 + 9 + 25 + 49}{16} \right) \times 0.5 = \frac{84}{16} \times \frac{1}{2} = \frac{21}{4} \times \frac{1}{2} = \frac{21}{8} = 2.625$$
6. **Exact Value:**
   $$\int_0^2 x^2 \, dx = \left[ \frac{x^3}{3} \right]_0^2 = \frac{8}{3} \approx 2.666667$$
7. **Error Analysis:**
   * **Absolute Error:**
     $$\text{Error} = \left| \frac{8}{3} - \frac{21}{8} \right| = \left| \frac{64 - 63}{24} \right| = \frac{1}{24} \approx 0.041667$$
   * **Relative Error:**
     $$\text{Relative Error} = \frac{1/24}{8/3} = \frac{1}{64} = 1.5625\%$$

#### Academic Commentary on Accuracy
* **Order of Accuracy:** The midpoint rule has truncation error $\mathcal{O}(\Delta x^2)$ (second-order accurate), in contrast to the left/right Riemann sums which are only $\mathcal{O}(\Delta x)$ (first-order).
* **Geometric Intuition:** The tangent line to $f(x)$ at the midpoint cuts across the upper curve; the triangular area under-estimated on one half of the subinterval cancels out the area over-estimated on the other half.
* **Relevance to CT Ray-Tracing:** In CT line integration (e.g. Siddon's algorithm, Joseph's method), evaluating ray-voxel intersection lengths and midpoint densities delivers dramatically smaller discretization artifacts than simple voxel-corner sampling.

---

## Section 3: Linear Algebra for CT

### Discretized Forward Model: $Au = b$
* $u \in \mathbb{R}^n$: Image vector of unknown linear attenuation coefficients (flattened $N \times N$ grid, so $n = N^2$).
* $b \in \mathbb{R}^m$: Measured projection data (sinogram ray sums).
* $A \in \mathbb{R}^{m \times n}$: System matrix / projection matrix, where $A_{ij}$ is the contribution of voxel $j$ to ray $i$ (e.g. intersection length).
* **Row Picture:** Each equation $a_i^T u = b_i$ defines a hyperplane in $\mathbb{R}^n$. The solution $u$ is the mutual intersection point of all $m$ hyperplanes. (This is the geometric foundation of ART / Kaczmarz).
* **Column Picture:** $b = \sum_{j=1}^n u_j a_{*, j}$. The sinogram $b$ is represented as a linear combination of the columns of $A$.

---

### 3.1 Solution Cases for $Au = b$

| Case | Geometric Meaning | Rank & Consistency Condition | Typical CT Scenario |
| :--- | :--- | :--- | :--- |
| **1. Unique Solution** | The hyperplanes intersect at exactly one point; $b$ is in $\operatorname{col}(A)$, and columns of $A$ are linearly independent. | $\operatorname{rank}(A) = \operatorname{rank}([A \mid b]) = n$ (Full column rank; if $m=n$, $\det(A) \neq 0$). | Idealized, fully-sampled, noise-free, square discrete problem. |
| **2. Infinitely Many Solutions** | The hyperplanes intersect along a line, plane, or subspace; underdetermined system. | $\operatorname{rank}(A) = \operatorname{rank}([A \mid b]) = r < n$. Nullspace dimension $\dim(\operatorname{Null}(A)) = n - r > 0$. | **Limited-angle CT / Sparse-view CT**: Fewer projection measurements than image pixels ($m < n$). |
| **3. No Solution** | The hyperplanes do not meet at a common point; inconsistent system. | $\operatorname{rank}(A) < \operatorname{rank}([A \mid b])$. $b \notin \operatorname{col}(A)$ ($b$ lies outside the range of $A$). | **Real CT Scanners**: Overdetermined systems ($m > n$) with measurement noise, scatter, and patient motion. |

> **Rouché-Capelli Theorem:** A linear system $Au = b$ is consistent if and only if the rank of the coefficient matrix $A$ equals the rank of the augmented matrix $[A \mid b]$.

---

### 3.2 Detailed Solutions to Given Systems

---

#### System (i): $2 \times 2$ System
$$\begin{cases} x + 3y = 6 \\ 2x + 4y = 8 \end{cases}$$

##### (a) Matrix Form $Au = b$
$$A = \begin{bmatrix} 1 & 3 \\ 2 & 4 \end{bmatrix}, \quad u = \begin{bmatrix} x \\ y \end{bmatrix}, \quad b = \begin{bmatrix} 6 \\ 8 \end{bmatrix}$$

##### (b) Inversion of $A$

* **Method 1: Adjugate Formula**
  1. Determinant:
     $$\det(A) = (1)(4) - (3)(2) = 4 - 6 = -2$$
  2. Adjugate matrix (swap diagonals, negate off-diagonals):
     $$\operatorname{adj}(A) = \begin{bmatrix} 4 & -3 \\ -2 & 1 \end{bmatrix}$$
  3. Inverse:
     $$A^{-1} = \frac{1}{\det(A)} \operatorname{adj}(A) = \frac{1}{-2} \begin{bmatrix} 4 & -3 \\ -2 & 1 \end{bmatrix} = \begin{bmatrix} -2 & 1.5 \\ 1 & -0.5 \end{bmatrix}$$

* **Method 2: Gauss-Jordan Elimination on $[A \mid I]$**
  $$\left[\begin{array}{cc|cc} 1 & 3 & 1 & 0 \\ 2 & 4 & 0 & 1 \end{array}\right]$$
  1. Row operation $R_2 \leftarrow R_2 - 2R_1$:
     $$\left[\begin{array}{cc|cc} 1 & 3 & 1 & 0 \\ 0 & -2 & -2 & 1 \end{array}\right]$$
  2. Scale $R_2 \leftarrow -\frac{1}{2} R_2$:
     $$\left[\begin{array}{cc|cc} 1 & 3 & 1 & 0 \\ 0 & 1 & 1 & -0.5 \end{array}\right]$$
  3. Row operation $R_1 \leftarrow R_1 - 3R_2$:
     $$\left[\begin{array}{cc|cc} 1 & 0 & 1 - 3(1) & 0 - 3(-0.5) \\ 0 & 1 & 1 & -0.5 \end{array}\right] = \left[\begin{array}{cc|cc} 1 & 0 & -2 & 1.5 \\ 0 & 1 & 1 & -0.5 \end{array}\right]$$
  $$\therefore A^{-1} = \begin{bmatrix} -2 & 1.5 \\ 1 & -0.5 \end{bmatrix}$$

##### (c) Solving the System and Comparison

* **Via Gaussian Elimination:**
  Augmented matrix:
  $$\left[\begin{array}{cc|c} 1 & 3 & 6 \\ 2 & 4 & 8 \end{array}\right] \xrightarrow{R_2 \leftarrow R_2 - 2R_1} \left[\begin{array}{cc|c} 1 & 3 & 6 \\ 0 & -2 & -4 \end{array}\right]$$
  From row 2: $-2y = -4 \implies y = 2$.  
  Back-substitute into row 1: $x + 3(2) = 6 \implies x = 0$.  
  $$\therefore u = \begin{bmatrix} 0 \\ 2 \end{bmatrix}$$

* **Via Matrix Inversion $u = A^{-1} b$:**
  $$u = \begin{bmatrix} -2 & 1.5 \\ 1 & -0.5 \end{bmatrix} \begin{bmatrix} 6 \\ 8 \end{bmatrix} = \begin{bmatrix} (-2)(6) + (1.5)(8) \\ (1)(6) + (-0.5)(8) \end{bmatrix} = \begin{bmatrix} -12 + 12 \\ 6 - 4 \end{bmatrix} = \begin{bmatrix} 0 \\ 2 \end{bmatrix}$$
  *Comparison:* Both methods yield the identical solution vector $u = [0, 2]^T$.

---

#### System (ii): $3 \times 3$ System
$$\begin{cases} 2x - 3y = 3 \\ 4x - 5y + z = 7 \\ 2x - y - 3z = 5 \end{cases}$$

##### (a) Matrix Form $Au = b$
$$A = \begin{bmatrix} 2 & -3 & 0 \\ 4 & -5 & 1 \\ 2 & -1 & -3 \end{bmatrix}, \quad u = \begin{bmatrix} x \\ y \\ z \end{bmatrix}, \quad b = \begin{bmatrix} 3 \\ 7 \\ 5 \end{bmatrix}$$

##### (b) Inversion of $A$

* **Method 1: Adjugate Method**
  1. Determinant (expand along Row 1):
     $$\det(A) = 2 \cdot \begin{vmatrix} -5 & 1 \\ -1 & -3 \end{vmatrix} - (-3) \cdot \begin{vmatrix} 4 & 1 \\ 2 & -3 \end{vmatrix} + 0$$
     $$\begin{vmatrix} -5 & 1 \\ -1 & -3 \end{vmatrix} = (-5)(-3) - (1)(-1) = 15 + 1 = 16$$
     $$\begin{vmatrix} 4 & 1 \\ 2 & -3 \end{vmatrix} = (4)(-3) - (1)(2) = -12 - 2 = -14$$
     $$\det(A) = 2(16) + 3(-14) = 32 - 42 = -10$$
     Since $\det(A) = -10 \neq 0$, $A$ is invertible.

  2. Cofactor Matrix $C$:
     * Row 1:
       * $C_{11} = + ((-5)(-3) - (1)(-1)) = +16$
       * $C_{12} = - ((4)(-3) - (1)(2)) = -(-14) = +14$
       * $C_{13} = + ((4)(-1) - (-5)(2)) = +(-4 + 10) = +6$
     * Row 2:
       * $C_{21} = - ((-3)(-3) - (0)(-1)) = -(9) = -9$
       * $C_{22} = + ((2)(-3) - (0)(2)) = -6$
       * $C_{23} = - ((2)(-1) - (-3)(2)) = -(-2 + 6) = -4$
     * Row 3:
       * $C_{31} = + ((-3)(1) - (0)(-5)) = -3$
       * $C_{32} = - ((2)(1) - (0)(4)) = -2$
       * $C_{33} = + ((2)(-5) - (-3)(4)) = +(-10 + 12) = +2$
     $$C = \begin{bmatrix} 16 & 14 & 6 \\ -9 & -6 & -4 \\ -3 & -2 & 2 \end{bmatrix}$$

  3. Adjugate Matrix $\operatorname{adj}(A) = C^T$:
     $$\operatorname{adj}(A) = \begin{bmatrix} 16 & -9 & -3 \\ 14 & -6 & -2 \\ 6 & -4 & 2 \end{bmatrix}$$

  4. Inverse $A^{-1} = \frac{1}{\det(A)} \operatorname{adj}(A) = -\frac{1}{10} \operatorname{adj}(A)$:
     $$A^{-1} = \begin{bmatrix} -1.6 & 0.9 & 0.3 \\ -1.4 & 0.6 & 0.2 \\ -0.6 & 0.4 & -0.2 \end{bmatrix} = \begin{bmatrix} -8/5 & 9/10 & 3/10 \\ -7/5 & 3/5 & 1/5 \\ -3/5 & 2/5 & -1/5 \end{bmatrix}$$

* **Method 2: Gauss-Jordan Elimination on $[A \mid I]$**
  $$\left[\begin{array}{ccc|ccc} 2 & -3 & 0 & 1 & 0 & 0 \\ 4 & -5 & 1 & 0 & 1 & 0 \\ 2 & -1 & -3 & 0 & 0 & 1 \end{array}\right]$$
  1. Eliminate below pivot in column 1 ($R_2 \leftarrow R_2 - 2R_1$, $R_3 \leftarrow R_3 - R_1$):
     $$\left[\begin{array}{ccc|ccc} 2 & -3 & 0 & 1 & 0 & 0 \\ 0 & 1 & 1 & -2 & 1 & 0 \\ 0 & 2 & -3 & -1 & 0 & 1 \end{array}\right]$$
  2. Eliminate below pivot in column 2 ($R_3 \leftarrow R_3 - 2R_2$):
     $$\left[\begin{array}{ccc|ccc} 2 & -3 & 0 & 1 & 0 & 0 \\ 0 & 1 & 1 & -2 & 1 & 0 \\ 0 & 0 & -5 & 3 & -2 & 1 \end{array}\right]$$
  3. Scale $R_3 \leftarrow -\frac{1}{5} R_3$:
     $$\left[\begin{array}{ccc|ccc} 2 & -3 & 0 & 1 & 0 & 0 \\ 0 & 1 & 1 & -2 & 1 & 0 \\ 0 & 0 & 1 & -0.6 & 0.4 & -0.2 \end{array}\right]$$
  4. Eliminate above pivot in column 3 ($R_2 \leftarrow R_2 - R_3$):
     $$\left[\begin{array}{ccc|ccc} 2 & -3 & 0 & 1 & 0 & 0 \\ 0 & 1 & 0 & -2 - (-0.6) & 1 - 0.4 & 0 - (-0.2) \\ 0 & 0 & 1 & -0.6 & 0.4 & -0.2 \end{array}\right] = \left[\begin{array}{ccc|ccc} 2 & -3 & 0 & 1 & 0 & 0 \\ 0 & 1 & 0 & -1.4 & 0.6 & 0.2 \\ 0 & 0 & 1 & -0.6 & 0.4 & -0.2 \end{array}\right]$$
  5. Eliminate above pivot in column 2 ($R_1 \leftarrow R_1 + 3R_2$):
     $$\left[\begin{array}{ccc|ccc} 2 & 0 & 0 & 1 + 3(-1.4) & 0 + 3(0.6) & 0 + 3(0.2) \\ 0 & 1 & 0 & -1.4 & 0.6 & 0.2 \\ 0 & 0 & 1 & -0.6 & 0.4 & -0.2 \end{array}\right] = \left[\begin{array}{ccc|ccc} 2 & 0 & 0 & -3.2 & 1.8 & 0.6 \\ 0 & 1 & 0 & -1.4 & 0.6 & 0.2 \\ 0 & 0 & 1 & -0.6 & 0.4 & -0.2 \end{array}\right]$$
  6. Scale $R_1 \leftarrow \frac{1}{2} R_1$:
     $$\left[\begin{array}{ccc|ccc} 1 & 0 & 0 & -1.6 & 0.9 & 0.3 \\ 0 & 1 & 0 & -1.4 & 0.6 & 0.2 \\ 0 & 0 & 1 & -0.6 & 0.4 & -0.2 \end{array}\right]$$
  $$\therefore A^{-1} = \begin{bmatrix} -1.6 & 0.9 & 0.3 \\ -1.4 & 0.6 & 0.2 \\ -0.6 & 0.4 & -0.2 \end{bmatrix}$$

##### (c) Solving the System and Comparison

* **Via Gaussian Elimination on Augmented Matrix $[A \mid b]$:**
  $$\left[\begin{array}{ccc|c} 2 & -3 & 0 & 3 \\ 4 & -5 & 1 & 7 \\ 2 & -1 & -3 & 5 \end{array}\right]$$
  Row operations: $R_2 \leftarrow R_2 - 2R_1$, $R_3 \leftarrow R_3 - R_1$:
  $$\left[\begin{array}{ccc|c} 2 & -3 & 0 & 3 \\ 0 & 1 & 1 & 1 \\ 0 & 2 & -3 & 2 \end{array}\right]$$
  Row operation: $R_3 \leftarrow R_3 - 2R_2$:
  $$\left[\begin{array}{ccc|c} 2 & -3 & 0 & 3 \\ 0 & 1 & 1 & 1 \\ 0 & 0 & -5 & 0 \end{array}\right]$$
  Back-substitution:
  1. From $R_3$: $-5z = 0 \implies \mathbf{z = 0}$.
  2. From $R_2$: $y + z = 1 \implies y + 0 = 1 \implies \mathbf{y = 1}$.
  3. From $R_1$: $2x - 3y = 3 \implies 2x - 3(1) = 3 \implies 2x = 6 \implies \mathbf{x = 3}$.
  $$\therefore u = \begin{bmatrix} 3 \\ 1 \\ 0 \end{bmatrix}$$

* **Via Matrix Inversion $u = A^{-1} b$:**
  $$u = \begin{bmatrix} -1.6 & 0.9 & 0.3 \\ -1.4 & 0.6 & 0.2 \\ -0.6 & 0.4 & -0.2 \end{bmatrix} \begin{bmatrix} 3 \\ 7 \\ 5 \end{bmatrix} = \begin{bmatrix} -1.6(3) + 0.9(7) + 0.3(5) \\ -1.4(3) + 0.6(7) + 0.2(5) \\ -0.6(3) + 0.4(7) - 0.2(5) \end{bmatrix} = \begin{bmatrix} -4.8 + 6.3 + 1.5 \\ -4.2 + 4.2 + 1.0 \\ -1.8 + 2.8 - 1.0 \end{bmatrix} = \begin{bmatrix} 3 \\ 1 \\ 0 \end{bmatrix}$$
  *Comparison:* Gaussian elimination and matrix inversion yield the identical solution $u = [3, 1, 0]^T$.

---

### 3.3 Iterative Reconstruction Methods in CT

#### General Framework (1–2 sentences)
> Iterative reconstruction algorithms start with an initial image estimate $u^{(0)}$ (e.g. a blank or uniform slice) and iteratively refine it according to an update rule $u^{(k+1)} = u^{(k)} + \alpha_k \mathcal{K}(A, b - A u^{(k)})$, repeatedly projecting current simulated rays ($A u^{(k)}$), computing the residual mismatch against measured detector data ($b - A u^{(k)}$), and backprojecting corrections into the image.

#### Two Major Advantages over Direct Inversion ($A^{-1}$)
1. **Computational & Memory Feasibility:**
   * For a standard medical CT slice of $512 \times 512$ pixels, $n \approx 2.6 \times 10^5$. A full matrix $A^{-1}$ contains over $6.8 \times 10^{10}$ dense float entries ($\approx 275 \text{ GB}$ of RAM for a single 2D slice!).
   * Iterative methods never compute or store $A^{-1}$. Furthermore, because $A$ is sparse, forward projections ($A$) and backprojections ($A^T$) are computed dynamically "on the fly" using ray-tracing hardware/GPU pipelines without ever assembling $A$ in memory.
2. **Handling Incomplete Data, Noise, and Physical Constraints:**
   * Real medical CT datasets are ill-conditioned, noisy, and often under-sampled (low dose, sparse views, or metal implants).
   * Direct inversion fails or produces severe streaking and noise amplification. Iterative methods easily integrate physical priors (such as non-negativity $u \ge 0$, since attenuation cannot be negative) and edge-preserving regularization (e.g. Total Variation, $\ell_1$-wavelet sparsity) to dramatically reduce radiation dose while maintaining diagnostic image quality.

---

### 3.4 The Least Squares Problem in CT

#### Standard Academic Definition
> **Definition (Least Squares Problem):**  
> Given a matrix $A \in \mathbb{R}^{m \times n}$ and a measured data vector $b \in \mathbb{R}^m$, the linear least squares problem seeks a solution vector $u^* \in \mathbb{R}^n$ that minimizes the squared Euclidean norm of the residual vector:
> $$u^* = \arg\min_{u \in \mathbb{R}^n} \|b - A u\|_2^2 = \arg\min_{u \in \mathbb{R}^n} \sum_{i=1}^m \left( b_i - \sum_{j=1}^n A_{ij} u_j \right)^2$$
> The minimizer satisfies the **Normal Equations**:
> $$A^T A u = A^T b$$

#### Purpose in Computed Tomography
1. **Resolving Overdetermined & Inconsistent Systems:**  
   In clinical scanners, the number of detector measurements far exceeds the number of reconstructed pixels ($m > n$). Because of Poisson quantum photon noise, electronic detector noise, and patient motion, $b$ does not lie exactly in the column space of $A$ ($b \notin \operatorname{col}(A)$). An exact solution $Au = b$ does not exist. The least squares framework finds the image $u^*$ whose simulated projections $A u^*$ are as close as possible to the physical measurements $b$.
2. **Statistical Optimality (Maximum Likelihood):**  
   Under the assumption that measurement noise is zero-mean independent and identically distributed (i.i.d.) Gaussian, the least squares estimator is the mathematically provable **Maximum Likelihood Estimator (MLE)** for the true attenuation distribution.
