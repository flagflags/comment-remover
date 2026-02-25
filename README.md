# synnine's comment remover tool <:

you know the drill. you ask ai for some code, it comes back looking like this:

```cpp
// Initialize the vector with default values
std::vector<int> nums = {1, 2, 3}; // stores our data

// Loop through each element
for (int i = 0; i < nums.size(); i++) {
    // Print the value to console
    std::cout << nums[i] << std::endl; // output
}
```

and you just wanted the code. not a lecture. not a guided tour. just the code.

paste it in. hit process. done. <:

---

## what it does

removes comments from source code without touching anything else. strings, urls, regex — all preserved correctly. uses a state machine parser so it doesn't get confused by `//` inside a string or `<!--` inside a script tag.

supports:
- **c++** — `//` and `/* */`
- **c#** — `//` and `/* */`
- **javascript / css** — `//` and `/* */`
- **html** — `<!-- -->`
- **auto-detect** — figures it out from the code itself

---

## why

ai assistants over-comment everything. every line gets a little note explaining what it does. it's fine for learning but when you're actually building something you end up doing a tedious find-and-delete session before the code even feels like yours.

this tool skips that part. >:

---

## usage

1. paste your code into the input box
2. pick a language (or leave it on auto-detect)
3. hit **process** 
4. copy the clean output

the **preserve line structure** checkbox controls whether blank lines left behind by removed comments are kept or collapsed. up to you.

---

## detection logic

auto-detect checks for strong signals in this order:

| language | signals checked |
|----------|----------------|
| c++ | `#include`, `std::`, `cout <<`, `int main(`, `nullptr`, `vector`, `template<` |
| html | `<!DOCTYPE`, `<html`, `<!--` |
| c# | `using System`, `namespace X {`, `Console.Write`, `#region` |
| js/css | fallback |

c++ is checked first on purpose — c++ and c# share some patterns and c++ is way more commonly pasted from ai output.

---

## built with

vanilla html, css, js. no dependencies.

---

## license

do whatever you want with it.
