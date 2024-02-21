# Bob's Mods - Blood Sample

## WORK IN PROGRESS - DO NOT USE

Find close by player. DONE
Take blood. DONE-ISH
Get blood type back quickly (5-10 seconds) DONE-ISH
Take blood sample to station WIP
Run full DNA comp
Get back results in a GUI
(potential) Graph that player has to check how close of a match
Each letter or number could represent a value.

## Items to be added to items.lua

```lua
    bloodsamplekit               = { name = 'bloodsamplekit', label = 'Blood sample kit', weight = 100, type = 'item', image = '_.png', unique = true, useable = true, shouldClose = true, combinable = nil, description = 'Unsued blood sample kit' },
    bloodsample                  = { name = 'bloodsample', label = 'Blood sample', weight = 50, type = 'item', image = '_.png', unique = true, useable = false, shouldClose = false, combinable = nil, description = 'Blood sample taken from someone' },
    bloodsamplereport            = { name = 'bloodsamplereport', label = 'Blood sample report', weight = 50, type = 'item', image = 'printerdocument.png', unique = true, useable = true, shouldClose = true, combinable = nil, description = 'A report comparing 2 blood samples' },
```
