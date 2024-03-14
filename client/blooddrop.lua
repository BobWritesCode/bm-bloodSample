local BloodDrops = {}
local BloodSplats = {}

local myBloodID = "AAA111BBB222"

RegisterNetEvent('bm-bloodEvidence:client:blooddrop:createBloodSplat', function()
  local coords, spawnedObj = SpawnBloodSplat()
  local obj = GetServerDateTime()
  local id = GetNextID()
  local data = {
    id = id,
    zone = "bloodslpat_".. tostring(id),
    coords = coords,
    entity = spawnedObj,
    bloodID = myBloodID,
    source = "bloodsplat",
    bloodType = "A+",
    location = GetStreetName(),
    datetime = obj.datetime,
    time =  obj.time,
    quality = "Fresh",
    notes = '',
  }
  exports['qb-target']:AddCircleZone(data.zone, vector3(data.coords.x, data.coords.y, data.coords.z), 0.5, {
    name = data.zone,
    useZ = true,
    debugPoly = true,
  }, {
    options = {
      {
        type = 'client',
        action = function()
          PickUpBloodSplat(data)
        end,
        icon = 'fas fa-sign-in-alt',
        label = 'Collect blood',
        data = data,
      },
    },
    distance = 1.5
  })
end)

-- RegisterNetEvent('bm-bloodEvidence:client:blooddrop:recieveBloodSplat', function(data)

-- end)


-- RegisterNetEvent('bm-bloodEvidence:client:blooddrop:recieveBloodDrop', function(BloodDropID, data)
--   BloodDrops[BloodDropID] = {}
--   BloodDrops[BloodDropID].coords = data.coords
--   BloodDrops[BloodDropID].time = data.time
--   print(BloodDropID)
-- end)
