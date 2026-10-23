/**
 * High-performance mathematical utilities for the Fibonacci Sequence
 */

// BigInt fast doubling algorithm: computes [F(n), F(n+1)] in O(log n) time
export function getFibonacciBigIntPair(n: number): [bigint, bigint] {
  if (n <= 0) return [0n, 1n];
  const [a, b] = getFibonacciBigIntPair(Math.floor(n / 2));
  const c = a * (2n * b - a);
  const d = a * a + b * b;
  if (n % 2 === 0) {
    return [c, d];
  } else {
    return [d, c + d];
  }
}

export function getFibonacciBigInt(n: number): bigint {
  if (n < 0) return 0n;
  return getFibonacciBigIntPair(n)[0];
}

// Generate the first k Fibonacci numbers up to index k-1
export function generateFibonacciSequence(count: number): number[] {
  const result: number[] = [];
  let a = 0;
  let b = 1;
  for (let i = 0; i < count; i++) {
    result.push(a);
    const next = a + b;
    a = b;
    b = next;
  }
  return result;
}

export const PHI = (1 + Math.sqrt(5)) / 2; // 1.618033988749895

export function getRatio(n: number): { ratio: number; diff: number; fN: number; fPrev: number } {
  if (n < 2) return { ratio: 1, diff: Math.abs(1 - PHI), fN: 1, fPrev: 1 };
  const seq = generateFibonacciSequence(n + 1);
  const fN = seq[n];
  const fPrev = seq[n - 1];
  const ratio = fPrev === 0 ? 0 : fN / fPrev;
  const diff = Math.abs(ratio - PHI);
  return { ratio, diff, fN, fPrev };
}

export function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export function getPisanoSequence(mod: number, maxTerms = 64): number[] {
  if (mod < 2) return [0];
  const result: number[] = [0, 1 % mod];
  let a = 0;
  let b = 1 % mod;
  for (let i = 2; i < maxTerms; i++) {
    const next = (a + b) % mod;
    result.push(next);
    a = b;
    b = next;
    if (a === 0 && b === 1 % mod && i > 2) {
      break;
    }
  }
  return result;
}

/**
 * Zeckendorf's Theorem decomposition: represents any positive integer
 * as a unique sum of non-consecutive Fibonacci numbers.
 */
export function getZeckendorfDecomposition(target: number): number[] {
  if (target <= 0 || !Number.isFinite(target)) return [];
  const fibs: number[] = [1, 2];
  while (fibs[fibs.length - 1] < target) {
    const next = fibs[fibs.length - 1] + fibs[fibs.length - 2];
    if (next > target) break;
    fibs.push(next);
  }
  const components: number[] = [];
  let rem = Math.floor(target);
  for (let i = fibs.length - 1; i >= 0 && rem > 0; i--) {
    if (fibs[i] <= rem) {
      components.push(fibs[i]);
      rem -= fibs[i];
      i--; // skip adjacent Fibonacci number (non-consecutive rule)
    }
  }
  return components;
}

/**
 * Intelligent mathematical & exhibition knowledge engine for instant fallback or offline resilience.
 */
export function generateFibonacciLabResponse(question: string, persona = 'curator'): string {
  const q = question.toLowerCase().trim();

  const personaPrefix =
    persona === 'leonardo'
      ? 'As Leonardo of Pisa (author of Liber Abaci, 1202), here is my perspective:\n\n'
      : persona === 'biophysicist'
      ? 'From the Laboratory Biophysics & Phyllotaxis perspective:\n\n'
      : persona === 'algorithmist'
      ? 'From a Theoretical Computer Science & Algorithmic perspective:\n\n'
      : '';

  // 1. Check if user asks for a specific F(n) calculation or "nth fibonacci"
  const matchF =
    q.match(/f\(\s*(\d+)\s*\)/i) ||
    q.match(/(?:fibonacci|term|number|index|n\s*=)\s*(?:of|for|at)?\s*(\d+)/i) ||
    q.match(/(\d+)\s*(?:st|nd|rd|th)\s*fibonacci/i);

  if (matchF) {
    const rawN = parseInt(matchF[1], 10);
    const n = Math.min(1000, Math.max(0, rawN));
    const val = getFibonacciBigInt(n);
    const prev1 = n > 0 ? getFibonacciBigInt(n - 1) : 0n;
    const prev2 = n > 1 ? getFibonacciBigInt(n - 2) : 0n;
    const valStr = val.toString();
    const digits = valStr.length;

    return `${personaPrefix}For index n = ${n}, the exact Fibonacci number is:\n\nF(${n}) = ${valStr}\n(${digits} ${digits === 1 ? 'digit' : 'digits'})\n\n${
      n >= 2
        ? `Recurrence Verification:\nF(${n - 2}) + F(${n - 1}) = ${prev2.toString()} + ${prev1.toString()} = ${valStr}`
        : 'This is one of the foundational base cases of the sequence: F(0) = 0, F(1) = 1.'
    }\n\nAlgorithmic Insight: Using the Fast Matrix Doubling identity F(2k) = F(k)[2F(k+1) − F(k)], our laboratory computes F(${n}) in just ${Math.max(1, Math.ceil(Math.log2(Math.max(2, n))))} steps instead of O(2ⁿ) recursion.`;
  }

  // 2. Check if user asks about Zeckendorf's Theorem or decomposing a number
  if (q.includes('zeckendorf') || q.includes('decompose') || q.includes('sum of non-consecutive')) {
    const numMatch = q.match(/\b(\d+)\b/);
    const sampleNum = numMatch ? Math.min(100000, Math.max(1, parseInt(numMatch[1], 10))) : 100;
    const parts = getZeckendorfDecomposition(sampleNum);
    return `${personaPrefix}Zeckendorf’s Theorem states that every positive integer can be uniquely represented as the sum of one or more non-consecutive Fibonacci numbers (meaning no two adjacent Fibonacci numbers are used in the sum).\n\nLive Example for ${sampleNum}:\n${sampleNum} = ${parts.join(' + ')}\n\nNotice that none of the terms (${parts.join(', ')}) are adjacent in the Fibonacci sequence (1, 2, 3, 5, 8, 13, 21, 34, 55, 89...). This unique representation is the basis of "Fibonacci Coding" used in data compression!`;
  }

  // 3. Golden Ratio / 1.618 / Phi
  if (
    q.includes('1.618') ||
    q.includes('golden') ||
    q.includes('phi') ||
    q.includes('ratio') ||
    q.includes('converge') ||
    q.includes('divide')
  ) {
    return `${personaPrefix}As Fibonacci numbers grow larger, the ratio of consecutive terms F(n) / F(n−1) converges toward the Golden Ratio:\n\nφ = (1 + √5) / 2 ≈ 1.618033988749895...\n\nMathematical Proof:\n1. Start with the recurrence rule: F(n) = F(n−1) + F(n−2).\n2. Divide every term by F(n−1):\n   F(n) / F(n−1) = 1 + F(n−2) / F(n−1)\n3. As n → ∞, let the limit of F(n)/F(n−1) be φ. Then F(n−2)/F(n−1) approaches 1/φ:\n   φ = 1 + 1/φ  ⇒  φ² − φ − 1 = 0\n4. Solving via the quadratic formula gives φ = (1 + √5) / 2 ≈ 1.6180339887.\n\nEach step oscillates slightly above and below φ: 13/8 = 1.625, 21/13 ≈ 1.61538, 34/21 ≈ 1.61905, 55/34 ≈ 1.61765, locking closer with every term.`;
  }

  // 4. Nature / Sunflowers / Phyllotaxis / 137.5 degrees / Pinecones
  if (
    q.includes('sunflower') ||
    q.includes('nature') ||
    q.includes('plant') ||
    q.includes('137.5') ||
    q.includes('pinecone') ||
    q.includes('petal') ||
    q.includes('leaf') ||
    q.includes('phyllotaxis') ||
    q.includes('seed')
  ) {
    return `${personaPrefix}In botanical phyllotaxis—seen in sunflower seed heads (commonly 34 clockwise and 55 counterclockwise spirals) and pinecones (8 and 13 spirals)—new primordia emerge from the central shoot apex at the Golden Angle:\n\nθ = 360° × (1 − 1/φ) ≈ 137.50776°\n\nWhy does nature settle on this angle?\n• Because φ is the "most irrational" number (its continued fraction [1; 1, 1, 1, ...] is the hardest to approximate with simple fractions), rotating by 137.50776° ensures new seeds never line up along radial spokes.\n• Mechanically, existing buds inhibit new buds via auxin hormone gradients, forcing each new seed into the largest available gap—which naturally produces consecutive Fibonacci spiral families!`;
  }

  // 5. Nautilus shell / Myths vs Science
  if (q.includes('nautilus') || q.includes('shell') || q.includes('myth') || q.includes('universal')) {
    return `${personaPrefix}Science vs. Popular Myth: It is a widespread misconception that the Chambered Nautilus shell is a Golden Ratio spiral.\n\n• While a Nautilus shell is a true logarithmic (equiangular) spiral, biometric measurements of real shells show a growth expansion factor of roughly 1.24 to 1.43 per quarter-turn—not φ ≈ 1.618.\n• Similarly, Fibonacci numbers do not appear in every plant or galaxy by magic; they emerge specifically where sequential growth with space-filling packing (like sunflower florets and pinecone bracts) is governed by physical optimization.`;
  }

  // 6. Algorithms / Recursion / Big-O / Computing / Matrix / Binet
  if (
    q.includes('recursion') ||
    q.includes('algorithm') ||
    q.includes('complex') ||
    q.includes('binet') ||
    q.includes('compute') ||
    q.includes('fast') ||
    q.includes('code') ||
    q.includes('heap')
  ) {
    return `${personaPrefix}Computing the nth Fibonacci number F(n) is a classic benchmark in computer science:\n\n1. Naive Recursion: F(n) = F(n−1) + F(n−2) takes exponential time O(φⁿ) ≈ O(1.618ⁿ) because it recomputes the same subproblems millions of times.\n2. Dynamic Programming: Iteratively storing the last two numbers takes O(n) additions and O(1) space.\n3. Fast Matrix Doubling: Using [[1, 1], [1, 0]]ⁿ or the identities:\n   • F(2k) = F(k) · [2F(k+1) − F(k)]\n   • F(2k+1) = F(k+1)² + F(k)²\n   computes F(n) in O(log n) steps—finding F(100) in just 7 operations!\n4. Binet’s Formula: F(n) = (φⁿ − ψⁿ) / √5, where ψ = (1 − √5)/2 ≈ −0.618.`;
  }

  // 7. History / Leonardo of Pisa / Liber Abaci / India / Rabbits
  if (
    q.includes('history') ||
    q.includes('leonardo') ||
    q.includes('pisa') ||
    q.includes('liber') ||
    q.includes('rabbit') ||
    q.includes('india') ||
    q.includes('who') ||
    q.includes('invent') ||
    q.includes('origin')
  ) {
    return `${personaPrefix}Historical Origins of the Sequence:\n\n• Ancient Indian Prosody (200 BCE – 1150 CE): Long before the sequence was known in Europe, Indian scholars Pingala, Virahanka (~600 CE), Gopala, and Hemachandra (~1150 CE) discovered these numbers while counting how many ways short (1-beat) and long (2-beat) syllables can fill a line of Sanskrit poetry.\n• Leonardo of Pisa / Fibonacci (1202 CE): In his landmark book Liber Abaci ("The Book of Calculation"), Leonardo introduced the Hindu-Arabic numeral system (0–9) to Europe and posed the famous idealized rabbit-breeding puzzle in Chapter 12, generating 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377.\n• Édouard Lucas (1877): The French mathematician who officially named the numbers the "Fibonacci Sequence."`;
  }

  // 8. Spiral / Squares / Geometry
  if (q.includes('spiral') || q.includes('square') || q.includes('rectangle') || q.includes('arc')) {
    return `${personaPrefix}How the Fibonacci Spiral is Constructed:\n\n1. Start with two 1×1 squares side by side, forming a 2×1 rectangle.\n2. Attach a 2×2 square along the length of capacity 2, creating a 3×2 rectangle.\n3. Continue attaching squares of side length 3×3, 5×5, 8×8, 13×13, 21×21... Notice that each new square’s side equals the sum of the two previous square sides!\n4. Draw a smooth 90° quarter-circle arc inside each square connecting opposite corners. Because the squares share tangent edges, the quarter-circles join into a continuous expanding Fibonacci Spiral that closely approximates the logarithmic Golden Spiral.`;
  }

  // 9. Exhibition / Presentation / Judges tips
  if (q.includes('exhibition') || q.includes('present') || q.includes('judge') || q.includes('explain')) {
    return `${personaPrefix}Exhibition Presentation Strategy:\n\n1. Hook Visitors with Discovery: Start at Stage 01 (1, 1, 2, 3, 5, 8, 13, 21, 34, ?) and ask the visitor to guess 55 before showing the formula F(n) = F(n−1) + F(n−2).\n2. Show the Golden Ratio Visually: Use Stage 05 to show how dividing consecutive terms (55/34 ≈ 1.6176, 89/55 ≈ 1.6181) oscillates around φ ≈ 1.618034.\n3. Impress Judges with Scientific Rigor: Use Stage 06 (Nature) to demonstrate why sunflower seeds pack at 137.5°, and point out that while sunflowers genuinely exhibit Fibonacci spirals, the Nautilus shell is a logarithmic spiral with a different growth ratio (~1.3, not 1.618).\n\nTip: Click the gold [EXHIBITION MODE] button at the top right for full-screen slides, speaker scripts, and Judge Q&A cards!`;
  }

  // Default comprehensive answer
  return `${personaPrefix}The Fibonacci sequence (0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377...) is governed by the recurrence law:\n\nF(n) = F(n − 1) + F(n − 2), starting from F(0) = 0 and F(1) = 1.\n\nHere is what makes this simple rule extraordinary:\n• Golden Ratio Convergence: Dividing any Fibonacci number by the previous one (F(n)/F(n−1)) approaches φ = (1 + √5)/2 ≈ 1.6180339887...\n• Geometric Spirals: Tiling squares of side lengths 1, 1, 2, 3, 5, 8, 13... forms Golden Rectangles through which a continuous quarter-circle spiral flows.\n• Botanical Phyllotaxis: Sunflowers (34 & 55 spirals) and pinecones (8 & 13 spirals) space new seeds at the Golden Angle of 137.5° for optimal packing.\n• Fast Computation: Using matrix exponentiation, we can calculate huge terms like F(200) in O(log n) steps.\n\nTry asking me:\n• "What is F(100)?"\n• "Why does F(n)/F(n-1) approach 1.618?"\n• "Why do sunflowers grow in 34 and 55 spirals?"\n• "Decompose 2026 using Zeckendorf's Theorem"`;
}
