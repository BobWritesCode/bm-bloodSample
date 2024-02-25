QBCore = exports['qb-core']:GetCoreObject()

local DebugMode = Config.Debug
local NUIReady = false;

AddEventHandler('onResourceStart', function(resourceName)
  if GetCurrentResourceName() ~= resourceName then return end
  local i = 0
  while not NUIReady and i < 10 do
    i = i + 1
    if (DebugMode) then print("(BM-BloodEvidence) Waiting NUI to load. Attempt: " .. i) end
    Wait(1000)
    if i == 10 then
      if (DebugMode) then print('(BM-BloodEvidence) Failed to read NUI.') end
    end
  end
end)

RegisterNUICallback('nuiReady', function(_, cb)
  NUIReady = true
end)

RegisterNUICallback('printReport', function(data, cb)
  TriggerServerEvent('bm-bloodEvidence:server:printReport', data.reportId)
end)

RegisterNetEvent('bm-bloodEvidence:client:getBloodSampleFromPlayer', function()
  local targetPlayer, distance = QBCore.Functions.GetClosestPlayer()
  if not QBCore.Functions.HasItem(Config.RequiredItems.BloodSampleKit.Name) then
    QBCore.Functions.Notify("You do not have the required item.RegisterNetEvent", 'error')
    return -- Exit early.
  end
  if targetPlayer ~= -1 and distance < 2.5 or DebugMode then
    local targetPlayerId = not DebugMode and GetPlayerServerId(targetPlayer) or GetPlayerServerId(PlayerId())
    local notes = 'To be coded'
    local street = GetStreetName()
    TriggerServerEvent('bm-bloodEvidence:server:getBloodSampleFromPlayer', targetPlayerId, notes, street)
  else
    QBCore.Functions.Notify("No one close enough", 'error')
  end
end)

RegisterNetEvent('bm-bloodEvidence:client:showReport', function(reportId)
  QBCore.Functions.TriggerCallback('bm-bloodEvidence:server:getReport', function(responseCode, _data)
    SendNUIMessage({
      action = 'showReport',
      responseCode = responseCode,
      reportId = _data.id,
      report = _data.report,
    })
  end, reportId)
  SetNuiFocus(true, true)
end)

RegisterNetEvent('bm-bloodEvidence:client:provideBloodSample', function(bloodId, bloodtype)
end)


RegisterNetEvent('bm-bloodEvidence:client:openUI', function()
  if NUIReady then
    SendNUIMessage({
      action = 'openUI',
    })
    SetNuiFocus(true, true)
  end
end)

RegisterNUICallback('closeUI', function(_, cb)
  SetNuiFocus(false, false)
end)

local isProcessing = false
RegisterNUICallback('processItem', function(data, cb)
  while isProcessing do
    Wait(100)
  end
  isProcessing = true
  QBCore.Functions.TriggerCallback('bm-bloodEvidence:server:giveProcessedSample', function(isTrue)
    if isTrue then
      GetPlayerBloodSamples()
      isProcessing = false
    end
  end, data.slot, data.bloodId)
end)

RegisterNUICallback('createNewReport', function(data, cb)
  QBCore.Functions.TriggerCallback('bm-bloodEvidence:server:createNewReport', function(responseCode, id)
    SendNUIMessage({
      action = 'createNewReportResponse',
      responseCode = responseCode,
      id = id,
    })
  end, data.samples)
end)

RegisterNUICallback('getReport', function(data, cb)
  QBCore.Functions.TriggerCallback('bm-bloodEvidence:server:getReport', function(responseCode, _data)
    SendNUIMessage({
      action = 'showReport',
      responseCode = responseCode,
      reportId = _data.id,
      report = _data.report,
    })
  end, data.reportId)
end)

function GetStreetName()
  local ped = PlayerPedId()
  local coords = GetEntityCoords(ped)
  local streetHash, crossingHash = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
  local streetName = GetStreetNameFromHashKey(streetHash)
  return streetName
end

function GetPlayerBloodSamples()
  local Player = QBCore.Functions.GetPlayerData()
  local items = Player.items
  local processedBloodSamples = {}
  local unprocessedBloodSamples = {}
  for _, item in ipairs(items) do
    if item.name == Config.RequiredItems.BloodSample.Name then
      if item.info.processed then
        table.insert(processedBloodSamples, item)
      else
        table.insert(unprocessedBloodSamples, item)
      end
    end
  end
  SendNUIMessage({
    action = 'provideBloodSamplesOnPerson',
    processedBloodSamples = processedBloodSamples,
    unprocessedBloodSamples = unprocessedBloodSamples
  })
end

--##### Threads #####--
local analysierListen = false
local function analysierlistener()
  CreateThread(function()
    while analysierListen do
      if IsControlJustReleased(0, 38) then
        TriggerEvent('bm-bloodEvidence:client:openUI')
        GetPlayerBloodSamples()
        break
      end
      Wait(0)
    end
  end)
end

if Config.UseTarget then
  CreateThread(function()
    for k, v in pairs(Config.Locations.Analysiers) do
      exports['qb-target']:AddCircleZone('BloodAnalyser_' .. k, vector3(v.x, v.y, v.z), 0.5, {
        name = 'BloodAnalyser_' .. k,
        useZ = true,
        debugPoly = false,
      }, {
        options = {
          {
            type = 'client',
            event = 'bm-bloodEvidence:client:openTablet',
            icon = 'fas fa-fingerprint',
            label = "Run Blood",
            -- jobType = '',
          },
        },
        distance = 1.5
      })
    end
  end)
else
  local analysierZones = {}
  for _, v in pairs(Config.Locations.Analysiers) do
    analysierZones[#analysierZones + 1] = BoxZone:Create(
      vector3(vector3(v.x, v.y, v.z)), 1.75, 1, {
        name = 'box_zone',
        debugPoly = Config.Debug,
        minZ = v.z - 1,
        maxZ = v.z + 1,
      })
  end

  local analysierCombo = ComboZone:Create(analysierZones, { name = 'analysierCombo', debugPoly = Config.Debug })
  analysierCombo:onPlayerInOut(function(isPointInside)
    if isPointInside then
      analysierListen = true
      exports['qb-core']:DrawText("[E] Open analysis software", 'left')
      analysierlistener()
    else
      analysierListen = false
      exports['qb-core']:HideText()
    end
  end)
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
