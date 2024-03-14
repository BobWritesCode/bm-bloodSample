function GetStreetName()
  local ped = PlayerPedId()
  local coords = GetEntityCoords(ped)
  local streetHash, crossingHash = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
  local streetName = GetStreetNameFromHashKey(streetHash)
  return streetName
end

function GetServerDateTime()
  local p = promise.new()
  QBCore.Functions.TriggerCallback('bm-bloodEvidence:server:GetServerTime',
    function(data)
      p:resolve(data)
    end)
  return Citizen.Await(p)
end

function PickUpBloodSplat(data)
  QBCore.Functions.TriggerCallback('bm-bloodEvidence:server:PickUpBloodSplat',
    function(ret)
      if ret then
        ClearBloodSplat(data)
      end
    end, data)
end

function ClearBloodSplat(data)
  DeleteEntity(data.entity)
  exports['qb-target']:RemoveZone(data.zone)
end

function SpawnBloodSplat()
  local coords = GetEntityCoords(PlayerPedId())
  local heading = GetEntityHeading(PlayerPedId())
  local forward = GetEntityForwardVector(PlayerPedId())
  local x, y, z = table.unpack(coords + forward * 0.5)
  local spawnedObj = CreateObject("p_bloodsplat_s", x, y, z, true, false, false)
  PlaceObjectOnGroundProperly(spawnedObj)
  SetEntityHeading(spawnedObj, heading)
  FreezeEntityPosition(spawnedObj, true)
  SetEntityRotation(spawnedObj, 270.0, 180.0, 180.0, 2, false)
  local coords2 = GetEntityCoords(spawnedObj)
  SetEntityCoords(spawnedObj, coords2.x, coords2.y, coords2.z - 0.26, false, false, false, false)
  SetEntityCollision(spawnedObj, false, true)
  return coords2, spawnedObj
end

function GetNextID ()
  local p = promise.new()
  QBCore.Functions.TriggerCallback('bm-bloodEvidence:server:GetNextID',
    function(id)
      p:resolve(id)
    end)
  return Citizen.Await(p)
end

function Tprint(tbl, indent)
  if not indent then indent = 0 end
  for k, v in pairs(tbl) do
    local formatting = string.rep("  ", indent) .. k .. ": "
    if type(v) == "table" then
      print(formatting)
      Tprint(v, indent + 1)
    elseif type(v) == 'boolean' then
      print(formatting .. tostring(v))
    else
      print(formatting .. v)
    end
  end
end
