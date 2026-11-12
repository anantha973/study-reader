# Machine Learning — Assignment Sheet 3
**Name:** Nutan Kumar Anantha Sai | **Matrikelnummer:** 261304

---

## Assignment 3.1

### Given:
* $P(\text{cancer}) = 0.008, \quad P(\neg \text{cancer}) = 0.992$
* $P(+ \mid \text{cancer}) = 0.98, \quad P(- \mid \text{cancer}) = 0.02$
* $P(- \mid \neg \text{cancer}) = 0.97, \quad P(+ \mid \neg \text{cancer}) = 0.03$

### 1. After First Test ($T_1 = +$):
$$P(\text{cancer} \mid +) = \frac{P(+ \mid \text{cancer}) P(\text{cancer})}{P(+ \mid \text{cancer}) P(\text{cancer}) + P(+ \mid \neg \text{cancer}) P(\neg \text{cancer})}$$

$$P(\text{cancer} \mid +) = \frac{0.98 \times 0.008}{(0.98 \times 0.008) + (0.03 \times 0.992)} = \frac{0.00784}{0.00784 + 0.02976} = \frac{0.00784}{0.0376} = \frac{49}{235} \approx \mathbf{20.85\%}$$

### 2. After Second Independent Test ($T_2 = +$):
Using the posterior after the first test as prior ($P'(c) = \frac{49}{235}, P'(\neg c) = \frac{186}{235}$):

$$P(\text{cancer} \mid +, +) = \frac{0.98 \times \frac{49}{235}}{\left(0.98 \times \frac{49}{235}\right) + \left(0.03 \times \frac{186}{235}\right)} = \frac{48.02}{48.02 + 5.58} = \frac{48.02}{53.60} = \frac{2401}{2680} \approx \mathbf{89.59\%}$$

*(Equivalently with joint likelihood: $\frac{0.98^2 \times 0.008}{(0.98^2 \times 0.008) + (0.03^2 \times 0.992)} = \frac{0.0076832}{0.008576} \approx \mathbf{89.59\%}$)*

---

## Assignment 3.2

### a) Formulas & Relation to MAP
* **Bayes' Theorem:**
  $$P(v_j \mid a_1, \dots, a_n) = \frac{P(a_1, \dots, a_n \mid v_j) P(v_j)}{P(a_1, \dots, a_n)}$$
* **MAP Hypothesis:** (denominator is constant across classes):
  $$v_{\text{MAP}} = \arg\max_{v_j \in V} P(a_1, \dots, a_n \mid v_j) P(v_j)$$
* **Naive Bayes:** Decomposes joint likelihood under conditional independence:
  $$v_{\text{NB}} = \arg\max_{v_j \in V} P(v_j) \prod_{i=1}^n P(a_i \mid v_j)$$
  $v_{\text{NB}}$ approximates $v_{\text{MAP}}$ by replacing the full joint likelihood with the product of individual conditional probabilities.

### b) "Naive" Assumption & Relevance
* **Assumption:** Features are conditionally independent given the class:
  $$P(a_1, \dots, a_n \mid v_j) = \prod_{i=1}^n P(a_i \mid v_j)$$
* **Relevance:** Reduces parameters from exponential in $n$ ($O(k^n \cdot |V|)$) to linear ($O(n \cdot k \cdot |V|)$), making estimation feasible on small datasets and avoiding the curse of dimensionality.

### c) Probability Estimation & Classification
* **Estimation:**
  * Priors: $P(v_j) = \frac{|D_{v_j}|}{|D|}$
  * Discrete features (MLE): $P(a_i \mid v_j) = \frac{n_c}{n} = \frac{\text{count}(a_i \wedge v_j)}{\text{count}(v_j)}$ (or $\mathcal{N}(\mu, \sigma^2)$ for continuous features).
* **Classification:**
  Calculate $P(v_j) \prod_i P(a_i \mid v_j)$ for each class, pick the highest value. Normalize to get posteriors.

### d) Missing Values vs. Zero Frequency
* **Missing values:** At test time, omit missing attribute $a_i$ from the product $\prod_i P(a_i \mid v_j)$ (marginalization: $\sum_{a_i} P(a_i \mid v_j) = 1$).
* **Zero frequency:** When $n_c = 0$, MLE sets $P(a_i \mid v_j) = 0$, zeroing the entire product.
  * Solved via **$m$-estimate**: $P(a_i \mid v_j) = \frac{n_c + m \cdot p}{n + m}$ (uniform prior $p = 1/k$).
  * Or **Laplace smoothing**: $P(a_i \mid v_j) = \frac{n_c + 1}{n + k}$.

---

## Assignment 3.3

### Training Data Summary ($N=10$):
* $n_{\text{yes}} = 7 \implies P(\text{yes}) = 0.7$
* $n_{\text{no}} = 3 \implies P(\text{no}) = 0.3$

| Attribute | Value Counts (`yes`, $n=7$) | Value Counts (`no`, $n=3$) |
| :--- | :--- | :--- |
| **Outlook** ($k=3$) | sunny: 2, overcast: 3, rain: 2 | sunny: 1, overcast: 0, rain: 2 |
| **Temperature** ($k=3$) | hot: 1, mild: 3, cool: 3 | hot: 0, mild: 2, cool: 1 |
| **Humidity** ($k=2$) | high: 1, normal: 6 | high: 2, normal: 1 |
| **Wind** ($k=2$) | strong: 3, weak: 4 | strong: 2, weak: 1 |

---

### a) Maximum Likelihood Estimation (MLE)

#### Instance $i_1 = (\text{sunny}, \text{cool}, \text{high}, \text{strong})$:
* $P'(\text{yes}) = 0.7 \times \frac{2}{7} \times \frac{3}{7} \times \frac{1}{7} \times \frac{3}{7} = \frac{18}{3430} \approx 0.005248$
* $P'(\text{no}) = 0.3 \times \frac{1}{3} \times \frac{1}{3} \times \frac{2}{3} \times \frac{2}{3} = \frac{2}{135} \approx 0.014815$
* **Posterior Probabilities:**
  $$P(\text{yes} \mid i_1) = \frac{0.005248}{0.005248 + 0.014815} \approx \mathbf{26.16\%}$$
  $$P(\text{no} \mid i_1) = \frac{0.014815}{0.005248 + 0.014815} \approx \mathbf{73.84\%}$$
* **Classification:** **`no`**

#### Instance $i_2 = (\text{overcast}, \text{mild}, \text{normal}, \text{weak})$:
* $P'(\text{yes}) = 0.7 \times \frac{3}{7} \times \frac{3}{7} \times \frac{6}{7} \times \frac{4}{7} = \frac{36}{1715} \approx 0.020991$
* $P'(\text{no}) = 0.3 \times \mathbf{\frac{0}{3}} \times \frac{2}{3} \times \frac{1}{3} \times \frac{1}{3} = \mathbf{0}$
* **Posterior Probabilities:**
  $$P(\text{yes} \mid i_2) = \mathbf{100.00\%}, \quad P(\text{no} \mid i_2) = \mathbf{0.00\%}$$
* **Classification:** **`yes`**

---

### b) $m$-Estimate ($m=1$, uniform $p=1/k$)
* Denominators: `yes` $\to 7+1=8$, `no` $\to 3+1=4$.
* Priors: $p_{\text{outlook}} = 1/3, p_{\text{temp}} = 1/3, p_{\text{humidity}} = 1/2, p_{\text{wind}} = 1/2$.

#### Instance $i_1$:
* $P'(\text{yes}) = 0.7 \times \frac{2 + 1/3}{8} \times \frac{3 + 1/3}{8} \times \frac{1 + 1/2}{8} \times \frac{3 + 1/2}{8} = 0.7 \times \frac{7}{24} \times \frac{10}{24} \times \frac{3}{16} \times \frac{7}{16} \approx 0.006978$
* $P'(\text{no}) = 0.3 \times \frac{1 + 1/3}{4} \times \frac{1 + 1/3}{4} \times \frac{2 + 1/2}{4} \times \frac{2 + 1/2}{4} = 0.3 \times \frac{1}{3} \times \frac{1}{3} \times \frac{5}{8} \times \frac{5}{8} \approx 0.013021$
* **Posterior Probabilities:**
  $$P(\text{yes} \mid i_1) = \frac{0.006978}{0.006978 + 0.013021} \approx \mathbf{34.89\%}$$
  $$P(\text{no} \mid i_1) = \frac{0.013021}{0.006978 + 0.013021} \approx \mathbf{65.11\%}$$
* **Classification:** **`no`**

#### Instance $i_2$:
* $P'(\text{yes}) = 0.7 \times \frac{3 + 1/3}{8} \times \frac{3 + 1/3}{8} \times \frac{6 + 1/2}{8} \times \frac{4 + 1/2}{8} = 0.7 \times \frac{10}{24} \times \frac{10}{24} \times \frac{13}{16} \times \frac{9}{16} \approx 0.055542$
* $P'(\text{no}) = 0.3 \times \mathbf{\frac{0 + 1/3}{4}} \times \frac{2 + 1/3}{4} \times \frac{1 + 1/2}{4} \times \frac{1 + 1/2}{4} = 0.3 \times \frac{1}{12} \times \frac{7}{12} \times \frac{3}{8} \times \frac{3}{8} \approx 0.002051$
* **Posterior Probabilities:**
  $$P(\text{yes} \mid i_2) = \frac{0.055542}{0.055542 + 0.002051} \approx \mathbf{96.44\%}$$
  $$P(\text{no} \mid i_2) = \frac{0.002051}{0.055542 + 0.002051} \approx \mathbf{3.56\%}$$
* **Classification:** **`yes`**

#### Differences Observed:
1. **Zero Frequency:** In MLE, $P(\text{overcast} \mid \text{no}) = 0$ forced $P(\text{no} \mid i_2) = 0\%$. With $m$-estimate, $P(\text{overcast} \mid \text{no}) = 1/12$, giving a non-zero probability of $3.56\%$.
2. **Smoothing:** Probability distribution moves closer to prior ($i_1$ shifts from $73.8\% / 26.2\%$ to $65.1\% / 34.9\%$).
3. **Decisions:** Predicted classes remain identical ($i_1 \to \text{no}, i_2 \to \text{yes}$).

---

## Assignment 3.4

### a) Estimating Word Probability
* **Multinomial model with Laplace smoothing:**
  $$P(w_k \mid c) = \frac{n_{k,c} + 1}{n_c + |V|}$$
  where $n_{k,c}$ is count of word $w_k$ in class $c \in \{\text{spam}, \text{ham}\}$, $n_c$ is total words in class $c$, and $|V|$ is vocabulary size.
* *(Or Bernoulli model:* $P(w_k \mid c) = \frac{D_{k,c} + 1}{D_c + 2}$ using document counts*).*

### b) Calculating Email Size Probability
* **Gaussian density:**
  $$P(\text{size}=S \mid c) = \frac{1}{\sqrt{2\pi\sigma_c^2}} \exp\left(-\frac{(S - \mu_c)^2}{2\sigma_c^2}\right)$$
  fitting mean $\mu_c$ and variance $\sigma_c^2$ of size $S$ (or $\ln S$) per class.
* **Discretization:** Bin size (e.g., small, medium, large) and estimate relative frequencies with smoothing: $P(\text{bin} \mid c) = \frac{N_{\text{bin},c} + 1}{N_c + K}$.

### c) Problems with Regular Naive Bayes in Spam Filtering
1. **Conditional independence violation:** Correlated phrases (*"click here"*, *"free offer"*) lead to double-counting and overconfident posteriors ($\approx 0$ or $1$).
2. **Zero frequency / OOV tokens:** Unseen words zero out the entire product without smoothing.
3. **Numerical underflow:** Multiplying many small probabilities causes floating-point underflow; must use log-space ($\sum \ln P$).
4. **Good word attack:** Spammers append benign text to overwhelm spam signals.
