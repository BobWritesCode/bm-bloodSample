let isUIOpen = false;
let isGamePlaying = false;
let isWaitingInput = false;
let currentKeyToPress = 0;
let intSelectedSamples = 0;
let intStepsRequired = 0;
let intScore = 0;
const PAGES = [
  'page-1',
  'page-sample-processing',
  'page-create-report-sample-selection',
  'page-show-report',
  'page-sample-process-selection',
  'page-create-report-comparison',
];
const BASE_STEPS_REQ = 10;
let arrSelectedSamples = {};
let intPrimarySample;
let processedBloodSamples = 0;
let unprocessedBloodSamples = 0;

const ARROW_ICONS = {
  down: {
    icon: $(`<i class="bi bi-arrow-down-square"></i>`),
    key: 40, // Arrow Down: 40
  },
  up: {
    icon: $(`<i class="bi bi-arrow-up-square"></i>`),
    key: 38, // Arrow Up: 38
  },
  left: {
    icon: $(`<i class="bi bi-arrow-left-square"></i>`),
    key: 37, // Arrow Left: 37
  },
  right: {
    icon: $(`<i class="bi bi-arrow-right-square"></i>`),
    key: 39, // Arrow Right: 39
  },
};

window.addEventListener('DOMContentLoaded', function () {
  $.post('https://bm-bloodsample/nuiReady', JSON.stringify({}));
});

window.addEventListener(
  'load',
  function () {
    const forms = $('form');
    const validation = Array.prototype.filter.call(forms, function (form) {
      form.addEventListener(
        'submit',
        function (event) {
          event.preventDefault();
          if (form.checkValidity() === false) {
            event.stopPropagation();
          } else {
            switch (form.id) {
              case 'form-unprocessedBloodSampleSelection':
                openPage('page-sample-processing');
                break;
              case 'form-retrieveReportById':
                GetReport(null, true);
                break;
              case 'form-processedBloodSampleContainer':
                openPage('page-create-report-comparison');
                showComparisons(Object.values(arrSelectedSamples));
                break;
              case 'form-notes':
                break;
              default:
                break;
            }
          }
          form.classList.add('was-validated');
        },
        false,
      );
    });
  },
  false,
);

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    window.addEventListener('message', function (e) {
      switch (e.data.action) {
        case 'openUI':
          OpenUI();
          arrSelectedSamples = {};
          break;
        case 'closeUI':
          CloseUI();
          break;
        case 'provideBloodSamplesOnPerson':
          processedBloodSamples = e.data.processedBloodSamples;
          unprocessedBloodSamples = e.data.unprocessedBloodSamples;
          updateSampleCount();
          break;
        case 'createNewReportResponse':
          createNewReportResponse(e.data.id);
          break;
        case 'showReport':
          OpenUI();
          if (e.data.inTablet) {
            ShowReportInTablet(e.data.responseCode, e.data.reportId, e.data.report);
          } else {
            ShowReport(e.data.responseCode, e.data.reportId, e.data.report);
          }
          break;
        case 'openNoteBox':
          OpenUI();
          OpenNoteBox();
          break;
        default:
          break;
      }
    });
  }
};

$(document).on('keydown', function (e) {
  if (isUIOpen) {
    switch (e.keyCode) {
      case 27: // 27 = ESC
        CloseUI();
        break;
    }
  }
  if (isGamePlaying && isWaitingInput) {
    isWaitingInput = false;
    if (e.keyCode == currentKeyToPress) {
      $('#mini-game').css('color', 'green');
      intScore++;
    } else {
      $('#mini-game').css('color', 'red');
      intScore--;
    }
  }
});

function OpenUI() {
  if (!isUIOpen) {
    isUIOpen = true;
    $('#main').css('display', 'block');
    $('#appContainer').css('display', 'block');
    $('body').css('display', 'block');
  }
}

function OpenNoteBox() {
  $('#main').css('display', 'none');
  $('#notes').css('display', 'block');
}

function CloseNoteBox() {
  $('#notes').css('display', 'none');
}

function CloseUI() {
  arrSelectedSamples = {};
  if (isUIOpen) {
    isUIOpen = false;
    $('#main').css('display', 'none');
    $('#appContainer').css('display', 'none');
    $('body').css('display', 'none');
    $('#report').css('display', 'none');
    CloseNoteBox();
    $.post('https://bm-bloodsample/closeUI', JSON.stringify({}));
  }
}

function PrintReport(id) {
  const reportId = id ? id : $('#inputRetrieveReportById').val();
  $.post('https://bm-bloodsample/printReport', JSON.stringify({ reportId: reportId }));
}

function GetReport(id, inTablet) {
  const reportId = id ? id : $('#inputRetrieveReportById').val();
  $.post(
    'https://bm-bloodsample/getReport',
    JSON.stringify({ reportId: reportId, inTablet: inTablet }),
  );
}

function StartMiniGame() {
  if (isGamePlaying) {
    return;
  }
  $('#btnCreateReport').prop('disabled', true);
  $('#btnStartMiniGame').prop('disabled', true);
  isGamePlaying = true;
  let _countdown = 3;
  let _i = 0;
  let _y = intSelectedSamples;
  let _z = intStepsRequired;
  intScore = 0;
  $('.samplesSelected').text(`${_y}`);
  $('.stepsRequired').text(`${_z}`);
  $('#mini-game-progress-bar').css('width', '0');
  $('#mini-game-results').empty();

  const countDown = setInterval(() => {
    $('#mini-game').text(`${_countdown}`);
    _countdown--;
    if (_countdown === 0) {
      clearInterval(countDown);
      $('#mini-game').text(`Go!`);
      const startGame = setInterval(() => {
        const _r = Math.floor(Math.random() * Object.keys(ARROW_ICONS).length);
        const randomArrow = Object.values(ARROW_ICONS)[_r].icon;
        $('#mini-game').html(randomArrow);
        currentKeyToPress = Object.values(ARROW_ICONS)[_r].key;
        $('#mini-game').css('color', 'white');
        isWaitingInput = true;
        _i++;
        $('#mini-game-progress-bar').css('width', `${(_i / _z) * 100}%`);
        if (_i === _z) {
          clearInterval(startGame);
          $('#mini-game').empty();
          isGamePlaying = false;
          processUnprocessedSamples();
          $('#mini-game-results-container').css('display', 'flex');
        }
      }, 500);
    }
  }, 1000);
}

function ScrambleResult(k) {
  if (arrSelectedSamples[k].info.processed) {
    return arrSelectedSamples[k].info.bloodId;
  }
  str = arrSelectedSamples[k].info.bloodId;
  const _z = intStepsRequired;
  const result = [...str]
    .map((el) => {
      const rand = Math.floor(Math.random() * 100);
      return rand <= (intScore / _z) * 100 ? el : '_';
    })
    .join('');
  arrSelectedSamples[k].info.processed = true;
  $.post(
    'https://bm-bloodsample/processItem',
    JSON.stringify({ slot: arrSelectedSamples[k].slot, bloodId: result }),
  );
  return result;
}

function getMatchPercentage(_targetSampleStr, _newBloodID) {
  let min_length = Math.min(_targetSampleStr.length, _newBloodID.length);
  let max_length = Math.min(_targetSampleStr.length, _newBloodID.length);
  let matches = 0;
  for (let i = 0; i < min_length; i++) {
    if (
      _targetSampleStr[i] === _newBloodID[i] &&
      (_targetSampleStr[i] != '_' || _newBloodID[i] != '_')
    ) {
      matches++;
    }
  }
  return (matches / max_length) * 100;
}

function processUnprocessedSamples() {
  Object.keys(arrSelectedSamples).forEach((k) => {
    let result = ScrambleResult(k);
    arrSelectedSamples[k].info.bloodId = result;

    const element = arrSelectedSamples[k];
    const el = $(`
      <div class="d-flex flex-column border border-success rounded me-2 mb-2 p-2 text-light justify-content-center align-items-center">
        <p class="fw-bold mb-0">ID: <span class="fw-normal">${element.info.id}</span></p>
        <p class="fw-bold mb-0">Source: <span class="fw-normal">${element.info.source}</span></p>
        <p class="fw-bold mb-0">Quality: <span class="fw-normal">${element.info.quality}</span></p>
        <p class="fw-bold mb-0">Blood ID: <span class="fw-normal roboto-mono-400">${element.info.bloodId}</span></p>
        <p class="fw-bold mb-0">BloodType: <span class="fw-normal">${element.info.bloodType}</span></p>
        <p class="fw-bold mb-0">Source: <span class="fw-normal">${element.info.source}</span></p>
        <p class="fw-bold mb-0">Location: <span class="fw-normal">${element.info.location}</span></p>
        <p class="fw-bold mb-0">Date Time: <span class="fw-normal">${element.info.datetime}</span></p>
        <p class="fw-bold mb-0">Notes: <span class="fw-normal">${element.info.notes}</span></p>
      <div>
    `);
    $('#mini-game-results').append(el);
  });
}

function showComparisons(obj, _target) {
  $('#processedBloodSampleComparisonContainer').empty();
  let _targetStr;
  if (_target) {
    _targetStr = obj[_target].info.bloodId;
  }
  let i = -1;
  Object.keys(obj).forEach((k) => {
    i++;
    const _currentID = obj[k].info.id;
    let matchPercentage;
    let bloodId = obj[k].info.bloodId;
    if (_target && i == _target) {
      obj[k].info.matchPercent = 'PRIMARY';
    }
    if (_target && i != _target) {
      matchPercentage = getMatchPercentage(_targetStr, bloodId);
      obj[k].info.matchPercent = matchPercentage;
    }
    let conditionallyRenderedPart = '';
    if (_target) {
      conditionallyRenderedPart = `<p class="mb-1">Match: <span class="fw-normal">${Number(
        matchPercentage,
      ).toFixed(2)}</span>%</p>`;
    }
    if (_target && i == _target) {
      conditionallyRenderedPart = `<p class="mb-1">  <span class="fw-normal">PRIMARY</span></p>`;
    }
    const element = obj[k];
    const el = $(`
      <input type="radio" class="btn-check" name="options-outlined" id="result-bs-${element.info.id}" autocomplete="off">
      <label class="btn btn-outline-success me-2 mb-2 text-light" for="result-bs-${element.info.id}">
        <p class="fw-bold mb-0">ID: <span class="fw-normal">${element.info.id}</span></p>
        <p class="fw-bold mb-0">Source: <span class="fw-normal">${element.info.source}</span></p>
        <p class="fw-bold mb-0">Quality: <span class="fw-normal">${element.info.quality}</span></p>
        <p class="fw-bold mb-0">Blood ID: <span class="fw-normal roboto-mono-400">${element.info.bloodId}</span></p>
        <p class="fw-bold mb-0">BloodType: <span class="fw-normal">${element.info.bloodType}</span></p>
        <p class="fw-bold mb-0">Source: <span class="fw-normal">${element.info.source}</span></p>
        <p class="fw-bold mb-0">Location: <span class="fw-normal">${element.info.location}</span></p>
        <p class="fw-bold mb-0">Date Time: <span class="fw-normal">${element.info.datetime}</span></p>
        <p class="fw-bold mb-0">Notes: <span class="fw-normal">${element.info.notes}</span></p>
        <p class="mb-1">Result: <span class="fw-normal">${bloodId}</span></p>
        ${conditionallyRenderedPart}
      </label>
    `);
    if (i == _target) {
      el.prop('checked', true);
    }
    $('#processedBloodSampleComparisonContainer').append(el);
    el.on('change', function (e) {
      $('#btnCreateReport').prop('disabled', false);
      if (el.prop('checked')) {
        showComparisons(obj, k);
      }
      $('#btnCreateReport')
        .prop('disabled', false)
        .css('justify-self', 'center;')
        .css('align-self', 'center;');
    });
  });
  $('#form-processedBloodSampleComparisonContainer').unbind('submit');
  $('#form-processedBloodSampleComparisonContainer').submit(function () {
    createNewReport(obj);
    return false;
  });
}

function createNewReport(obj) {
  $('#btnCreateReport').prop('disabled', true);
  $.post('https://bm-bloodsample/createNewReport', JSON.stringify({ samples: obj }));
}

function createNewReportResponse(id) {
  $('#mini-game-after-create-report-container').css('display', 'flex');
  $('#mini-game-after-create-report').empty();
  $('#mini-game-after-create-report').html(`
    <p>Your report has been generated. The ID is <span>${id}</span></p>
  `);
  $('.printCreatedReport').unbind('click');
  $('.printCreatedReport').click(function () {
    PrintReport(id);
  });
  $('.printCreatedReport').text(`Print report: ${id}`);
}

function openPage(pageToOpen) {
  $('.btnProcessSelected').prop('disabled', true);
  PAGES.forEach((el) => {
    const boolX = el == pageToOpen ? 'block' : 'none';
    $(`#${el}`).css('display', boolX);
  });

  switch (pageToOpen) {
    case 'page-sample-processing':
      $('#mini-game-results-container').css('display', 'none');
      SetUpBloodSamplePage();
      break;
    case 'page-sample-process-selection':
      showPlayerBloodSamples(unprocessedBloodSamples, 'unprocessedBloodSampleContainer');
      break;
    case 'page-create-report-sample-selection':
      showPlayerBloodSamples(processedBloodSamples, 'processedBloodSampleContainer');
      $('#mini-game-after-create-report-container').css('display', 'none');
      $('#mini-game-after-create-report').empty();
      break;
    default:
      break;
  }
}

function updateSampleCount() {
  const intX = unprocessedBloodSamples.length;
  const intY = processedBloodSamples.length;
  $('.intUnprocessedSample').text(intX);
  const boolX = intX == 0 ? true : false;
  $('#btnGotoSampleSelection').prop('disabled', boolX);
  $('.intProcessedSample').text(intY);
  const boolY = intY == 0 ? true : false;
  $('#btnGotoReportCreatePage').prop('disabled', boolY);
}

function updateSelectedSamplesCount(boolX) {
  boolX ? intSelectedSamples++ : intSelectedSamples--;
  const boolY = intSelectedSamples ? false : true;
  $('.btnProcessSelected').prop('disabled', boolY);
  $('.samplesSelected').text(intSelectedSamples);
  updateStepsRequired(intSelectedSamples);
  $('.stepsRequired').text(intStepsRequired);
}

function updateStepsRequired(intX) {
  intStepsRequired = intX > 0 ? BASE_STEPS_REQ + 1 * intX : 0;
}

function showPlayerBloodSamples(objBloodSamples, container) {
  intSelectedSamples = 0;
  arrSelectedSamples = {};
  const c = $('#' + container);
  c.empty();
  let i = 0;
  objBloodSamples.forEach((bs) => {
    let conditionallyRenderedPart = bs.info.processed
      ? `<p class="fw-bold mb-0">Blood ID: <span class="fw-normal roboto-mono-400">${bs.info.bloodId}</span></p>`
      : `<p class="fw-bold mb-0">Blood ID: <span class="fw-normal roboto-mono-400">???</span></p>`;

    const el = $(`
      <input type="checkbox" class="btn-check" name="options-outlined" id="bs-${i}-${container}" autocomplete="off">
      <label class="btn btn-outline-success me-2 mb-2 text-light" for="bs-${i}-${container}">
        <p class="fw-bold mb-0">ID: <span class="fw-normal">${bs.info.id}</span></p>
        <p class="fw-bold mb-0">Source: <span class="fw-normal">${bs.info.source}</span></p>
        <p class="fw-bold mb-0">Quality: <span class="fw-normal">${bs.info.quality}</span></p>
        ${conditionallyRenderedPart}
        <p class="fw-bold mb-0">BloodType: <span class="fw-normal">${bs.info.bloodType}</span></p>
        <p class="fw-bold mb-0">Location: <span class="fw-normal">${bs.info.location}</span></p>
        <p class="fw-bold mb-0">Date Time: <span class="fw-normal">${bs.info.datetime}</span></p>
        <p class="fw-bold mb-0">Notes: <span class="fw-normal">${bs.info.notes}</span></p>
      </label>`);
    c.append(el);
    el.on('change', function (e) {
      if (el.prop('checked')) {
        updateSelectedSamplesCount(true);
        arrSelectedSamples[bs.info.id] = bs;
      } else {
        updateSelectedSamplesCount(false);
        delete arrSelectedSamples[bs.info.id];
      }
    });
    i++;
  });
}

function getReportFromServer(reportID) {}

function ShowReport(responseCode, reportId, reportData) {
  const report = JSON.parse(reportData);
  $('#main').css('display', 'none');
  $('#report').css('display', 'block');
  const resultsContainer = $('#report-results-container-others');
  resultsContainer.empty();
  $('#report-report-id').html(`
    <h3>Report ID: ${reportId}</h3>
    <hr/>
  `);
  Object.keys(report).forEach((k) => {
    const bs = report[k].info;
    const conditionallyRenderedPart =
      bs.matchPercent == 'PRIMARY'
        ? `<p class="mb-1">  <span class="fw-normal">PRIMARY</span></p>`
        : `<p class="mb-1">Match: <span class="fw-normal">${Number(bs.matchPercent).toFixed(
            2,
          )}</span>%</p>`;
    resultsContainer.append(`
      <div class='d-flex justify-content-between pt-1'>
        <h3>Sample ID: ${bs.id}</h3>
        <h3>${conditionallyRenderedPart}</h3>
      </div>
      <div>
        <p class="fw-bold mb-0">Source: <span class="fw-normal">${bs.source}</span></p>
        <p class="fw-bold mb-0">Quality: <span class="fw-normal">${bs.quality}</span></p>
        <p class="fw-bold mb-0">bloodId: <span class="fw-normal roboto-mono-400">${bs.bloodId}</span></p>
        <p class="fw-bold mb-0">BloodType: <span class="fw-normal">${bs.bloodType}</span></p>
        <p class="fw-bold mb-0">Location: <span class="fw-normal">${bs.location}</span></p>
        <p class="fw-bold mb-0">Date Time: <span class="fw-normal">${bs.datetime}</span></p>
        <p class="fw-bold mb-0">Notes: <span class="fw-normal">${bs.notes}</span></p>
      </div>
      <hr/>
    `);
  });
}

function ShowReportInTablet(responseCode, reportId, reportData) {
  const resultsContainer = $('#report-results-container-others2');
  resultsContainer.empty();
  $('.printCreatedReport').unbind('click');

  let report;
  try {
    report = JSON.parse(reportData);
  } catch (error) {
    $('.printCreatedReport').prop('disabled', true);
    $('.printCreatedReport').text(`Print report: N/A`);
    $('#report-report-id2').html(`
      <h3>No report to show</h3>
      <hr/>
    `);
    return;
  }

  $('.printCreatedReport').click(function () {
    PrintReport(reportId);
  });
  $('.printCreatedReport').text(`Print report: ${reportId}`);
  $('.printCreatedReport').prop('disabled', false);

  $('#report-report-id2').html(`
    <h3>Report ID: ${reportId}</h3>
    <hr/>
  `);
  Object.keys(report).forEach((k) => {
    const bs = report[k].info;
    const conditionallyRenderedPart =
      bs.matchPercent == 'PRIMARY'
        ? `<p class="mb-1">  <span class="fw-normal">PRIMARY</span></p>`
        : `<p class="mb-1">Match: <span class="fw-normal">${Number(bs.matchPercent).toFixed(
            2,
          )}</span>%</p>`;
    resultsContainer.append(`
      <div class='d-flex justify-content-between pt-1'>
        <h3>Sample ID: ${bs.id}</h3>
        <h3>${conditionallyRenderedPart}</h3>
      </div>
      <div>
        <p class="fw-bold mb-0">Source: <span class="fw-normal">${bs.source}</span></p>
        <p class="fw-bold mb-0">Quality: <span class="fw-normal">${bs.quality}</span></p>
        <p class="fw-bold mb-0">bloodId: <span class="fw-normal roboto-mono-400">${bs.bloodId}</span></p>
        <p class="fw-bold mb-0">BloodType: <span class="fw-normal">${bs.bloodType}</span></p>
        <p class="fw-bold mb-0">Location: <span class="fw-normal">${bs.location}</span></p>
        <p class="fw-bold mb-0">Date Time: <span class="fw-normal">${bs.datetime}</span></p>
        <p class="fw-bold mb-0">Notes: <span class="fw-normal">${bs.notes}</span></p>
      </div>
      <hr/>
    `);
  });
}

function SetUpBloodSamplePage() {
  $('#mini-game-container').css('display', 'flex');
  $('#mini-game-after-create-report-container').css('display', 'none');
  $('#btnStartMiniGame').prop('disabled', false);
  $('#mini-game-results').empty();
  $('#mini-game-progress-bar').css('width', `0%`);
}
