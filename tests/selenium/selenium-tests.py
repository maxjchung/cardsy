from selenium import webdriver
from time import time, sleep

# Open Cardsy
driver = webdriver.Firefox()
driver.get('http://localhost:8083/')

# Controls
addCanvasButton = driver.find_element_by_id('new')
deleteCanvasButton = driver.find_element_by_id('delete')
nextCanvasButton = driver.find_element_by_id('next')
canvasIndicator = driver.find_element_by_id('canvas-indicator')



# [Test] Can we create a new card on the canvas?
element = driver.find_element_by_id('canvas')
element.click()
assert driver.title == "Cardsy"

# [Test] Can we add a canvas?
addCanvasButton.click()
assert canvasIndicator.text == "2 of 2"

# [Test] Can we page through our canvases?
nextCanvasButton.click()
assert canvasIndicator.text == "1 of 2"

# [Test] Does adding a canvas from here put it in the right spot?
addCanvasButton.click()
assert canvasIndicator.text == "3 of 3"

# [Test] Can we delete a canvas properly?
deleteCanvasButton.click()
assert canvasIndicator.text == "2 of 2"

# Done!
driver.quit()
