## Data
### der_data.md
Experiment results are presented in a highly similar way as task 1, for example:
```
"131": {
  "label": 1,
  "synthesized_code": 'xxxxx',
  "reasoning": "xxxxxx",
  "output": "xxxx",
  "ground-truth": "xxxx" ## please ignore this attribute.
}
```
Each result will have three ```labels```: 0 (synthesized code didn't pass all the tests), 1(synthesized code passed all the test but didn't generate the correct input in the reasoning), 2(synthesized code passed all the test and generate the correct input in the reasoning)  

If the label is 1, then it will not have ```reasoning```, ```output``` and ```ground-truth```.

### dataset_synthesis.json
Pretty samilar to the dataset.json in Task 1.
```
"HumanEval_138": {
    "nl": "def is_equal_to_sum_even(n):\n    \"\"\"Evaluate whether the given number n can be written as the sum of exactly 4 positive even numbers\n\n    \"\"\"",
    "asserts": "def check(candidate):\n    assert candidate(4) == False\n    assert candidate(6) == False\n    assert candidate(8) == True\n    assert candidate(10) == True\n    assert candidate(11) == False\n    assert candidate(12) == True\n    assert candidate(13) == False\n    assert candidate(16) == True",
    "input_reasoning": "is_equal_to_sum_even(4) ",
    "output_reasoning": " False"
},
```
```nl```: Natural language description for a code synthesis problem.

```asserts```: assertions which are used to test the generated code

```input_reasoning```: Input of the code which will be used if the generated code passes all the tests and we further evaluate it on code reasoning task.

```output_reasoning```: Ground-truth output.


## Todos
### Step 1. Silightly redesign the dropdowns.  
1. Please add another dropdown for different tasks, it will has three options: IER, DER and SR. What we have got in Task will be under 'IER'. What we are going to develop will be under 'DER'.

   Please add one more dropdown after 'datasets'.This dropdown will has two options: ```code synthesis``` and ```code translation```. Now we are developing results of ```code synthesis``` and will add code tranlstion later.

### Step 2. Present results.
I think what we have in task 1 is good: first present some information about the dataset (which can be foound in dataset_synthesis.json) then present experiment results. Plsease note that now we have three labels for results.

### Step 3.