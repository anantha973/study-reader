# Machine Learning — Assignment Sheet 4
**Name:** Nutan Kumar Anantha Sai | **Matrikelnummer:** 261304

---

## Assignment 4.1: Foundations of Decision Trees

### 1. How a Decision Tree Looks Like (Structure)
A decision tree is an upside-down tree structure that breaks down decisions into simple, sequential steps:
* **Root Node:** The very top node where the first question is asked on the whole dataset.
* **Internal (Decision) Nodes:** Intermediate nodes testing a specific feature (e.g., "Is Temperature = Warm?" or "Is Age $\le 5$?").
* **Branches:** The lines coming out of a node, each representing a possible answer or outcome of the test.
* **Leaf Nodes:** The end nodes with no outgoing branches. They contain the final prediction (class label like `+` or `-`).

![Decision Tree Structure](figures/decision_tree_concept.svg)

---

### 2. How a Decision Tree is Used for Classification (Inference)
To classify a new sample, we simply walk down the decision path:
1. Start at the root node.
2. If the current node is a leaf, return the class label stored at that leaf.
3. If the current node is an internal node:
   * Test the sample's value for the feature at that node.
   * Follow the branch that matches that value down to the next node.
   * Repeat this step recursively until reaching a leaf node.
* Because we only evaluate one feature per level, classification is very fast ($O(\text{depth})$).

---

### 3. How a Decision Tree is Learned (ID3 / CART)
The tree is built top-down using a greedy, recursive divide-and-conquer strategy:
1. **Choose the best feature:** Calculate Information Gain (or Gain Ratio) for all available features and pick the one that splits the data cleanest (highest purity).
2. **Create decision node & branches:** Assign this feature to the current node, create a branch for each of its possible values, and divide the training samples into matching subsets.
3. **Repeat recursively:** Run the exact same process on each branch with the remaining data and features.
4. **Stopping conditions (Base cases):**
   * All samples at a node belong to the same class (pure leaf).
   * No features are left to split on (assign majority class).
   * A branch has no training samples (assign parent node's majority class).

---

## Assignment 4.2: Decision Tree for Child Behavior Classification

### Problem Setup
* **Target Classes:** 3 classes $\to$ `Good`, `Neutral`, `Bad`.
* **Available Features:** `chores` (All, Most, Few, None), `noisiness` (1-10), `mess` (Yes, No), `treated_others` (Nice, Mean, No Interaction), `name`, `birth_date`, `supervisor`, `parents_income`.
* **Given Observations:** Behavior mostly depends on **age**, **noisiness**, and **treated_others**. Some supervisors grade harsher than others.

---

### 1. Feature Choices & Discussion

| Feature | Choice | Why / How to Handle |
| :--- | :---: | :--- |
| **`treated_others`** | **Include (Top Split)** | Primary behavioral factor. Direct categorical split (`Nice` $\to$ Good/Neutral, `Mean` $\to$ Bad). |
| **`birth_date` $\to$ `age`** | **Transform & Include** | Raw birth dates are unique and cause severe overfitting. Transform into `age = current_year - birth_year`, then use a threshold split (e.g., $\text{age} \le 5$). |
| **`noisiness`** | **Include** | Crucial numerical rating ($1\text{--}10$). Split using a numerical threshold (e.g., $\text{noisiness} \le 5$). |
| **`chores`** | **Include** | Secondary indicator helpful to separate `Good` from `Neutral`. |
| **`mess`** | **Include** | Simple yes/no flag to help separate `Neutral` from `Bad`. |
| **`supervisor`** | **Normalize (Debias)** | Harsh vs. lenient supervisors create inconsistent labels. Instead of splitting on supervisor (which overfits to current staff), normalize each supervisor's ratings (e.g. subtract their mean score) before training. |
| **`name`** | **DO NOT USE** | Every name is unique. The tree would memorize individual kids (100% training accuracy) and learn nothing for new children. |
| **`parents_income`** | **DO NOT USE** | Irrelevant to a child's daily behavior and introduces unfair, unethical bias. |

---

### 2. Possible Decision Tree

![Child Behavior Decision Tree](figures/child_behavior_tree.svg)

---

### 3. Challenges & How to Solve Them
1. **Supervisor Grading Bias:** Different graders have different standards. Solve by normalizing ratings per supervisor before training.
2. **Continuous / Number Features:** `noisiness` and `age` are numbers, not categories. Solve by testing threshold splits ($A \le \theta$) that give the highest Information Gain.
3. **Subjective Boundaries:** The boundary between `Neutral` and `Bad` has label noise. Solve by pruning small leaves to avoid fitting noisy ratings.

---

## Assignment 4.3: ID3 Decision Tree Induction & Version Space Comparison

### 1. Given Training Data ($N = 4$)
Target: **Enjoy Sport** ($y \in \{+, -\}$). Data has **3 positive ($+$)** and **1 negative ($-$)** instance.

| Instance | Sky | Temperature | Humidity | Wind | Water | Forecast | Enjoy Sport ($y$) |
| :-: | :---: | :---: | :---: | :---: | :---: | :---: | :-: |
| $x_1$ | Sunny | Warm | Normal | Strong | Warm | Same | **$+$** |
| $x_2$ | Sunny | Warm | High | Strong | Warm | Same | **$+$** |
| $x_3$ | Rainy | Cold | High | Strong | Warm | Change | **$-$** |
| $x_4$ | Sunny | Warm | High | Strong | Cool | Change | **$+$** |

---

### 2. Step 1: Root Entropy $H(S)$
Total instances = 4 ($p_+ = 3/4 = 0.75$, $p_- = 1/4 = 0.25$):

$$H(S) = - \frac{3}{4} \log_2 \frac{3}{4} - \frac{1}{4} \log_2 \frac{1}{4} = - (0.75 \times (-0.4150) + 0.25 \times (-2.0)) = \mathbf{0.8113 \text{ bits}}$$

---

### 3. Step 2: Information Gain for All 6 Attributes

$$\text{Gain}(S, A) = H(S) - \sum_{v} \frac{|S_v|}{|S|} H(S_v)$$

* **1. Sky (Sunny, Rainy, Cloudy):**
  * Sunny ($x_1, x_2, x_4$): $[3+, 0-] \implies H = 0; \quad$ Rainy ($x_3$): $[0+, 1-] \implies H = 0$
  * Expected Entropy: $\frac{3}{4}(0) + \frac{1}{4}(0) = 0 \implies \mathbf{\text{Gain}(S, \text{Sky}) = 0.8113 \text{ bits}}$
* **2. Temperature (Warm, Cold):**
  * Warm ($x_1, x_2, x_4$): $[3+, 0-] \implies H = 0; \quad$ Cold ($x_3$): $[0+, 1-] \implies H = 0$
  * Expected Entropy: $\frac{3}{4}(0) + \frac{1}{4}(0) = 0 \implies \mathbf{\text{Gain}(S, \text{Temperature}) = 0.8113 \text{ bits}}$
* **3. Forecast (Same, Change):**
  * Same ($x_1, x_2$): $[2+, 0-] \implies H = 0; \quad$ Change ($x_3, x_4$): $[1+, 1-] \implies H = 1.0$
  * Expected Entropy: $\frac{2}{4}(0) + \frac{2}{4}(1.0) = 0.5000 \implies \mathbf{\text{Gain}(S, \text{Forecast}) = 0.3113 \text{ bits}}$
* **4. Humidity (High, Normal):**
  * Normal ($x_1$): $[1+, 0-] \implies H = 0; \quad$ High ($x_2, x_3, x_4$): $[2+, 1-] \implies H \approx 0.9183$
  * Expected Entropy: $\frac{1}{4}(0) + \frac{3}{4}(0.9183) = 0.6887 \implies \mathbf{\text{Gain}(S, \text{Humidity}) = 0.1226 \text{ bits}}$
* **5. Water (Warm, Cool):**
  * Cool ($x_4$): $[1+, 0-] \implies H = 0; \quad$ Warm ($x_1, x_2, x_3$): $[2+, 1-] \implies H \approx 0.9183$
  * Expected Entropy: $\frac{1}{4}(0) + \frac{3}{4}(0.9183) = 0.6887 \implies \mathbf{\text{Gain}(S, \text{Water}) = 0.1226 \text{ bits}}$
* **6. Wind (Strong, Weak):**
  * Strong ($x_1, x_2, x_3, x_4$): all 4 samples are Strong $\implies [3+, 1-], H = 0.8113 \implies \mathbf{\text{Gain}(S, \text{Wind}) = 0.0000 \text{ bits}}$

---

### Summary Table of Information Gains

| Attribute | Expected Entropy | Information Gain | Rank |
| :--- | :---: | :---: | :---: |
| **Sky** | **0.0000** | **0.8113 bits** | **1 (Tie)** |
| **Temperature** | **0.0000** | **0.8113 bits** | **1 (Tie)** |
| **Forecast** | 0.5000 | 0.3113 bits | 3 |
| **Humidity** | 0.6887 | 0.1226 bits | 4 |
| **Water** | 0.6887 | 0.1226 bits | 4 |
| **Wind** | 0.8113 | 0.0000 bits | 6 |

---

### 4. Step 3: Resulting Decision Tree
**Sky** and **Temperature** tie with the maximum Information Gain ($0.8113$ bits). Either one splits the data into 100% pure leaves immediately:

![ID3 Resulting Decision Trees](figures/id3_result_trees.svg)

*(For `Cloudy`, no training samples exist, so it gets the majority class `+` of the parent).*

---

### 5. Step 4: Comparison with Version Space

#### Candidate Elimination on the 4 Examples:
* Specific Boundary: $S = \{\langle \text{Sunny}, \text{Warm}, ?, \text{Strong}, ?, ? \rangle\}$
* General Boundary: $G = \{\langle \text{Sunny}, ?, ?, ?, ?, ? \rangle, \langle ?, \text{Warm}, ?, ?, ?, ? \rangle\}$

#### Key Differences:
1. **Hypothesis Chosen:** ID3 outputs **one single tree**, which corresponds exactly to one of the hypotheses in the General Boundary $G$ ($\text{Sky}=\text{Sunny} \to +$ or $\text{Temp}=\text{Warm} \to +$). ID3 prefers the shortest tree, which naturally picks the most general rule.
2. **Expressiveness:**
   * Version Space can only represent **AND-rules** (conjunctions like $a_1 \wedge a_2$).
   * Decision Trees can represent **any combination of AND/OR rules** (Disjunctive Normal Form, DNF).
3. **Search Strategy (Bias):**
   * Version Space keeps **all** consistent hypotheses by restricting what rules it can learn (restriction bias).
   * ID3 uses a greedy search to find **one simple, short tree** without restricting rule types (preference bias).

---

## Assignment 4.4: Overfitting & Alternative Split Criteria

### 1. What is Overfitting?
A decision tree overfits when it learns the training data *too well*—memorizing noise, typos, and outliers—so its training error is almost zero, but its error on new, unseen test data gets worse:

$$\text{error}_{\text{train}}(h) < \text{error}_{\text{train}}(h') \quad \text{and} \quad \text{error}_D(h) > \text{error}_D(h')$$

---

### 2. Why Decision Trees Overfit
1. **Growing too deep:** If we let the tree split until every leaf is pure, it memorizes individual data points and noise.
2. **Fitting noise and errors:** A single mislabeled sample forces the tree to create extra, unnecessary branches just to isolate it.
3. **Small sample size at lower nodes:** Deep down the tree, nodes only contain 2 or 3 samples. Splitting on so few points is statistically unreliable.

---

### 3. How to Prevent Overfitting
* **Approach 1: Pre-Pruning (Stop growing early):**
  * Stop splitting if the split is not statistically significant ($\chi^2$ test).
  * Enforce stopping limits: maximum tree depth (`max_depth = 4`) or minimum samples per leaf (`min_samples_leaf = 5`).
  * Stop if Information Gain is below a threshold ($\text{Gain} < 0.01$).
* **Approach 2: Post-Pruning (Prune after growing — preferred):**
  * Let the tree grow fully, then cut back useless branches bottom-up:
    * **Reduced-Error Pruning:** Split data into training and a separate validation set. Greedily remove nodes that most improve validation accuracy.
    * **Rule Post-Pruning (C4.5):** Convert the tree into IF-THEN rules, prune each rule independently, and sort the final rules.
    * **Cost-Complexity Pruning (CART):** Penalize trees with too many leaves by minimizing $\text{Training Error} + \alpha \times (\text{Number of Leaves})$.

---

### 4. Two Alternative Split Criteria

#### 1. Gain Ratio (used in C4.5)
* **Problem with Information Gain:** If an attribute has many distinct values (like `Date` or `ID`), Information Gain will select it trivially, creating useless 1-sample leaves.
* **How Gain Ratio fixes it:** It divides Information Gain by the attribute's own entropy ($\text{SplitInformation}$):
  $$\text{GainRatio}(S, A) = \frac{\text{Gain}(S, A)}{\text{SplitInformation}(S, A)}$$
  $$\text{SplitInformation}(S, A) = - \sum_{i=1}^v \frac{|S_i|}{|S|} \log_2 \frac{|S_i|}{|S|}$$
  This penalizes attributes that split data into too many small fragments.

#### 2. Gini Impurity (used in CART and Scikit-Learn)
* **What it measures:** The probability of misclassifying a randomly chosen item if it were labeled randomly based on class proportions:
  $$\text{Gini}(S) = 1 - \sum_{k=1}^C p_k^2$$
* **Split rule (Gini Gain):** Pick the feature that gives the biggest drop in Gini impurity:
  $$\Delta \text{Gini}(S, A) = \text{Gini}(S) - \sum_{v} \frac{|S_v|}{|S|} \text{Gini}(S_v)$$
* **Why use it:** It is much faster to compute than Information Gain because it avoids logarithmic operations ($\log_2$), while producing almost the exact same decision trees.
