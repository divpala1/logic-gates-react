import React, { useState, useEffect } from 'react'
import './App.css'

export default function App() {
  // Variable for keeping a track of number of arguments.
  const [varCounter, setVarCounter] = useState(1)

  // Function to change the element to the selection, at the specified index, in the list specified.
  const editAtIndex = (listName, index, event) => {
    if (listName === "valueList") {
      const tempValueList = [...valueList]
      // The ternary operation at the end converts the string to boolean. So "true" becomes true (the boolean). It is necessary for proper functioning of the operation gates.
      tempValueList[index] = event.target.value === "true" ? true : false
      setValueList(tempValueList)
    }

    else if (listName === "nameList") {
      const tempList = [...nameList]
      tempList[index] = event.target.value
      setNameList(tempList)
    }

    else if (listName === "opList") {
      const tempList = [...opList]
      tempList[index] = event.target.value
      setOpList(tempList)
    }

    else if (listName === "opArgsList") {
      const tempList = [...opArgsList]
      tempList[index] = event.target.value
      setOpArgsList(tempList)
    }
  }

  // The two lists to store argument names and argument values. Element at an index in 'valueList', corresponds to the value of the element at the same index in 'nameList'.
  // E.g. nameList = ['Arg X', 'Arg Y']
  //      valueList = ['true', 'false']
  const [nameList, setNameList] = useState([])
  const [valueList, setValueList] = useState([])

  // Result related variables.
  const [result, setResult] = useState('default')
  const [argument, setArgument] = useState('')
  const resultList = ['constant', 'argument', 'AND', 'OR']

  // Variable for number of operations
  const [opCounter, setOpCounter] = useState(1)
  const [opList, setOpList] = useState([])
  // OpArgsList is necessary and cannot be replaced with nameList because when calculating the values after applying operations:
  // - User might change the order 
  // - There might be more variables in name list but user only uses a small portion of them. Which can be provisioned in the opArgsList.
  const [opArgsList, setOpArgsList] = useState([])

  // Functions to edit the result variable and argument variable (both of which are used to display the result) respectively.
  const handleResult = (event) => {
    setResult(event.target.value)
  }

  const handleArgument = (event) => {
    setArgument(event.target.value)
  }

  // Variable for final answer
  const [ans, setAns] = useState()

  // Function for calculating the answer after applying the operations to opperands.
  const calculate = () => {
    // E.g.
    // opList = ['AND', 'OR', 'AND']
    // opARGSList = ['a', 'b', 'c', 'd', 'e', 'f']

    // Firstly, the last 2 elements are paired according to the last operation in the list. So for our example, 'e AND f' is performed and stored in 'ans'. This is done because from here on, the operation will be applied to 3 variables, 2 which are in the list, and 1 value which the output of the 2 calculated below.

    // Last index of the operations list.
    const opList_lastIndex = opList.length - 1
    // Last index of the list including the arguments to be operated on.
    const opArgsList_lastIndex = opArgsList.length - 1

    // Here, nameList is the list of names of arguments provided by user. And valuelist the value corresponding to the names. OpArgsList is the list of arguments provided by the user to be calculated. 
    // So, we get the last and second last value of the opArgsList. Then, find the index of those values in nameList. Then the value at that specific index in the valueList is found so as to get the value of variable.
    const value_last = valueList[nameList.indexOf(opArgsList[opArgsList_lastIndex])]
    const value_second_last = valueList[nameList.indexOf(opArgsList[opArgsList_lastIndex - 1])]

    // This variable will store the values of operated arguments. The value is used for the same because when the setter function of 'ans' is called, the value of 'ans' will be reflected in the next render. So, if the 'ans' was called immediately after the updation, it would reflect the older value and not the updated one (within the function 'calculate'). Hence, the value is also stored in 'temp' so that the updated value can be used immediately after updation of 'ans'.
    let temp;

    if (opList[opList_lastIndex] === "AND") {
      temp = value_last && value_second_last
      setAns(temp)
    }
    else {
      temp = value_last || value_second_last
      setAns(temp)
    }

    // Calculating all the remaining values. From our example calculating first 'c' OR 'd' OR 'the result from above'. And then 'a' AND 'b' AND 'the result of the c OR d...' one.
    for (let i = opList.length - 2; i >= 0; i--) {
      const value_1 = valueList[nameList.indexOf(opArgsList[i * 2])]
      const value_2 = valueList[nameList.indexOf(opArgsList[i * 2 + 1])]

      if (opList[i] === "AND") {
        temp = value_1 && value_2 && temp
        setAns(temp)
      }
      else {
        temp = value_1 || value_2 || temp
        setAns(temp)
      }
    }
  }

  // `useEffect` is used so that each time there is a change in arguments, operations, etc. the answer is calculated again.
  useEffect(() => {
    // If all the the fields requiring the argument name are filled.
    if (opArgsList.length === opCounter * 2) {
      calculate()
    } else {
      setAns("Fill all the info.");
    }
  }, [opArgsList, valueList, opList, opCounter]);

  // Switch-case: The switch-case is used to define the variable content. The content variable is all that is displayed below the '+ Add Arg' button.
  // 'result' variable is defined when the user is first provided with the choice of constant, argument, AND, and OR.
  let content;
  switch (result) {
    // Case: Constant => When the user chooses constant in the dropdown menu. The code is applicable even when the values 'true' or 'false' are selected after the user has chosen 'constant'.
    case 'true':
    case 'false':
    case 'constant':
      content = <><div className='flex-row-center'>
        <select className='opsSelect' name="result" onChange={handleResult}>
          <option value="default">Select...</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>

        {/* Button to reset the 'result' value to the original */}
        <button className='opsBtn' onClick={() => { setResult('default') }}>x</button>
      </div>

        <h5>
          Result: {result && result !== 'constant' ? result : <>undefined</>}
        </h5>
      </>
      break;

    // Case: Argument => When the user chooses 'argument' in the initial dropdown menu.
    case 'argument':
      content = <>
        <div className='flex-row-center'>
          {/* Setting the choice of the user of the specific argument (to be displayed in the result) as the value of the variable 'argument'. */}
          <select className='opsSelect' name="result" onChange={handleArgument}>
            <option value="">Select...</option>
            {/* Iterating over the nameList (list storing the names of the arguments provided by user) and displaying them as an option in the dropdown menu within the 'argument' menu. */}
            {nameList.map((item) => (
              <option value={item}>{item}</option>
            ))}
          </select>
          <button className='opsBtn' onClick={() => { setResult('default') }}>x</button>
        </div>

        {/* Finding the index of argument from the nameList and then extracting the value of the same index from the valueList. */}
        <h5>
          Result: {argument ? valueList[nameList.indexOf(argument)].toString() : <>undefined</>}
        </h5>

      </>
      break;

    // Case: AND and OR
    case 'OR':
    case 'AND':
      const operations = ["AND", "OR"]

      content = <>
        <div className='flex-column-center'>
          {/* Displaying the operation, argument-1, and argument-2 the number of times of the opCounter (short for operation counter). When user clicks '+ Add Op', the counter is incremented. */}
          {Array.from({ length: opCounter }, (_, index) => (
            <div className='flex-column-center'>
              <div className="flex-row-center">
                <select className='opsSelect' name="operation" onChange={(event) => editAtIndex("opList", index, event)}>
                  <option value="">Select...</option>
                  {/* Displaying the available operations: AND and OR */}
                  {operations.map((item) => (
                    <option value={item}>{item}</option>
                  ))}
                </select>

                <button className='opsBtn' onClick={() => { setResult('default'); if (opCounter > 1) {setOpCounter(opCounter - 1)}; setOpList(opList) }}>x</button>
              </div>

              {/* --------- Argument-1 --------- */}

              {/* The index is done index*2 because, for each opCounter value, 2 arguments are shown. So, multiplying with 2 will ensure that the indices are in pairs like 0 and 1, 2 and 3, etc. When the user selects an argument, it is appended in the opArgsList (list of arguments that are to be calculated). */}
              <div className="flex-row-center subargs">
                <select className='opsSelect' name="OpArg1" onChange={(event) => editAtIndex
                  ("opArgsList", index * 2, event)}>
                  <option value="">Select...</option>
                  {/* Providing the arguments already entered as options */}
                  {nameList.map((item) => (
                    <option value={item}>{item}</option>
                  ))}
                </select>
                <button className='opsBtn'></button>
              </div>

              {/* --------- Argument-2 --------- */}
              <div className="flex-row-center subargs">
                <select className='opsSelect' name="OpArg2" onChange={(event) => editAtIndex("opArgsList", index * 2 + 1, event)}>
                  <option value="">Select...</option>
                  {nameList.map((item) => (
                    <option value={item}>{item}</option>
                  ))}
                </select>
                <button className='opsBtn'></button>
              </div>
            </div>
          ))}
          {/* Incrementing opCounter when '+ Add Op' is clicked. */}
          <button className='argsBtn' onClick={() => setOpCounter(opCounter + 1)}>+ Add Op</button>
        </div>

        {console.log("OpList:", opList, "\nArgs List:", opArgsList, "\nAns: ", ans)}
        {/* If result is found, display it. It needs to be converted to string because the res variable would be a boolean. */}
        <h5>
          Result: {ans !== undefined ? ans.toString() : "Select an Operation."}
        </h5>
      </>
      break;

    // Case: Default
    case 'default':
      content = <>
        <div className='flex-row-center'>
          <select className='opsSelect' name="result" onChange={handleResult}>
            <option value="default">Select...</option>
            {resultList.map((item) => (
              <option value={item}>{item}</option>
            ))}
          </select>
          <button className='opsBtn' onClick={() => { setResult('default') }}>x</button>
        </div>
        <h5>
          Result: {result && result !== 'default' ? result : <>undefined</>}
        </h5>
      </>
      break;
  }

  return (
    <div>
      <div className='arguments flex-column-center'>
        <h2>Arguments</h2>
        {/* Make an array of length varCounter to display an input tag and a select tag for all the arguments. When the user clicks '+ Add Arg', the varCounter is incremented by 1.*/}
        {Array.from({ length: varCounter }, (_, index) => (
          <div className='flex-row-center'>
            <input
              placeholder='Argument Name'
              type="text"
              onChange={(event) => { editAtIndex("nameList", index, event) }}
            />

            <select className='argsSelect' onChange={(event) => { editAtIndex("valueList", index, event) }}>
              <option value="">Select a value</option>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        ))}

        {/* Button to add arguments */}
        <button className='argsBtn' onClick={() => { setVarCounter(varCounter + 1) }}>+ Add Arg</button>

        <hr />

        <h2>Operator</h2>
        {content}
      </div>
    </div>
  )
}