/* eslint-disable react/prop-types */
import React from 'react';
import clone from 'ramda/src/clone';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { StaticRouter } from 'react-router-dom';
import { matchSnapshotAsync } from '@bbc/psammead-test-helpers';
import { ServiceContextProvider } from '#contexts/ServiceContext';
import { RequestContextProvider } from '#contexts/RequestContext';
import OnDemandRadioPage from '.';
import pashtoPageData from '#data/pashto/bbc_pashto_radio/w3ct0lz1';
import koreanPageData from '#data/korean/bbc_korean_radio/w3ct0kn5';
import indonesiaPageData from '#data/indonesia/bbc_indonesian_radio/w172xh267fpn19l';
import * as analyticsUtils from '#lib/analyticsUtils';
import { ToggleContextProvider } from '#contexts/ToggleContext';
import getInitialData from '#app/routes/onDemandRadio/getInitialData';

const Page = ({ pageData, service, isAmp = false }) => (
  <StaticRouter>
    <ToggleContextProvider
      service={service}
      origin="https://www.test.bbc.co.uk"
    >
      <ServiceContextProvider service={service}>
        <RequestContextProvider
          bbcOrigin="https://www.test.bbc.co.uk"
          isAmp={isAmp}
          pageType="media"
          pathname="/pathname"
          service={service}
          statusCode={200}
        >
          <OnDemandRadioPage service={service} pageData={pageData} />
        </RequestContextProvider>
      </ServiceContextProvider>
    </ToggleContextProvider>
  </StaticRouter>
);

const renderPage = async ({ pageData, service, isAmp = false }) => {
  let result;
  await act(async () => {
    result = await render(
      <Page pageData={pageData} service={service} isAmp={isAmp} />,
    );
  });

  return result;
};

analyticsUtils.getAtUserId = jest.fn();

jest.mock('../../containers/ChartbeatAnalytics', () => {
  const ChartbeatAnalytics = () => <div>chartbeat</div>;
  return ChartbeatAnalytics;
});

const { env } = process;

describe('OnDemand Radio Page ', () => {
  beforeEach(() => {
    process.env = { ...env };
  });

  it('should match snapshot for Canonical', async () => {
    const clonedPashtoPageData = clone(pashtoPageData);
    clonedPashtoPageData.content.blocks[0].versions[0] = {
      availableFrom: 1583496180000,
      availableUntil: 9999999999999,
    };
    const pashtoPageDataWithAvailableEpisode = clonedPashtoPageData;
    fetch.mockResponse(JSON.stringify(pashtoPageDataWithAvailableEpisode));
    fetch.mockResponse(JSON.stringify(pashtoPageData));

    const { pageData } = await getInitialData('some-ondemand-radio-path');

    await matchSnapshotAsync(<Page pageData={pageData} service="pashto" />);
  });

  it('should match snapshot for AMP', async () => {
    const clonedPashtoPageData = clone(pashtoPageData);
    clonedPashtoPageData.content.blocks[0].versions[0] = {
      availableFrom: 1583496180000,
      availableUntil: 9999999999999,
    };
    const pashtoPageDataWithAvailableEpisode = clonedPashtoPageData;
    fetch.mockResponse(JSON.stringify(pashtoPageDataWithAvailableEpisode));
    fetch.mockResponse(JSON.stringify(pashtoPageData));

    const { pageData } = await getInitialData('some-ondemand-radio-path');

    await matchSnapshotAsync(
      <Page pageData={pageData} service="pashto" isAmp />,
    );
  });

  it('should show the brand title for OnDemand Radio Pages', async () => {
    fetch.mockResponse(JSON.stringify(pashtoPageData));

    const { pageData: pageDataWithWithoutVideo } = await getInitialData(
      'some-ondemand-radio-path',
    );
    const { getByText } = await renderPage({
      pageData: pageDataWithWithoutVideo,
      service: 'pashto',
    });

    expect(getByText('ماښامنۍ خپرونه')).toBeInTheDocument();
  });

  it('should show the datestamp correctly for Pashto OnDemand Radio Pages', async () => {
    fetch.mockResponse(JSON.stringify(pashtoPageData));

    const { pageData } = await getInitialData('some-ondemand-radio-path');
    // Check destructuring like this works & amend for other tests
    const { getByText } = await renderPage({
      pageData,
      service: 'pashto',
    });

    expect(getByText('۱ می ۲۰۲۰')).toBeInTheDocument();
  });

  it('should show the datestamp correctly for Korean OnDemand Radio Pages', async () => {
    fetch.mockResponse(JSON.stringify(koreanPageData));

    const { pageData: pageDataWithWithoutVideo } = await getInitialData(
      'some-ondemand-radio-path',
    );
    const { getByText } = await renderPage({
      pageData: pageDataWithWithoutVideo,
      service: 'korean',
    });

    expect(getByText('2020년 5월 4일')).toBeInTheDocument();
  });

  it('should show the datestamp correctly for Indonesian OnDemand Radio Pages', async () => {
    fetch.mockResponse(JSON.stringify(indonesiaPageData));

    const { pageData: pageDataWithWithoutVideo } = await getInitialData(
      'some-ondemand-radio-path',
    );
    const { getByText } = await renderPage({
      pageData: pageDataWithWithoutVideo,
      service: 'indonesia',
    });

    expect(getByText('27 April 2020')).toBeInTheDocument();
  });

  it('should show the summary for OnDemand Radio Pages', async () => {
    fetch.mockResponse(JSON.stringify(indonesiaPageData));

    const { pageData: pageDataWithWithoutVideo } = await getInitialData(
      'some-ondemand-radio-path',
    );
    const { getByText } = await renderPage({
      pageData: pageDataWithWithoutVideo,
      service: 'indonesia',
    });

    expect(
      getByText(
        'Berita terbaru dari seluruh dunia dan ulasan peristiwa dari Indonesia. Juga berita olahraga terbaru dan berbeda setiap harinya.',
      ),
    ).toBeInTheDocument();
  });

  it('should show the audio player on canonical', async () => {
    const clonedKoreanPageData = clone(koreanPageData);
    clonedKoreanPageData.content.blocks[0].versions[0] = {
      availableFrom: 1583496180000,
      availableUntil: 9999999999999,
    };
    const koreanPageDataWithAvailableEpisode = clonedKoreanPageData;
    fetch.mockResponse(JSON.stringify(koreanPageDataWithAvailableEpisode));
    const { pageData } = await getInitialData('some-ondemand-radio-path');
    const { container } = await renderPage({ pageData, service: 'korean' });
    const audioPlayerIframeSrc = container
      .querySelector('iframe')
      .getAttribute('src');

    expect(audioPlayerIframeSrc).toEqual(
      'https://polling.test.bbc.co.uk/ws/av-embeds/media/korean/bbc_korean_radio/w3ct0kn5/ko?morph_env=live',
    );
  });

  it('should show the audio player on canonical using no override on live', async () => {
    process.env.SIMORGH_APP_ENV = 'live';
    const clonedKoreanPageData = clone(koreanPageData);
    clonedKoreanPageData.content.blocks[0].versions[0] = {
      availableFrom: 1583496180000,
      availableUntil: 9999999999999,
    };
    const koreanPageDataWithAvailableEpisode = clonedKoreanPageData;
    fetch.mockResponse(JSON.stringify(koreanPageDataWithAvailableEpisode));
    const { pageData } = await getInitialData('some-ondemand-radio-path');
    const { container } = await renderPage({ pageData, service: 'korean' });
    const audioPlayerIframeSrc = container
      .querySelector('iframe')
      .getAttribute('src');

    expect(audioPlayerIframeSrc).toEqual(
      'https://polling.bbc.co.uk/ws/av-embeds/media/korean/bbc_korean_radio/w3ct0kn5/ko',
    );
  });

  it('should show the audio player on AMP', async () => {
    const clonedKoreanPageData = clone(koreanPageData);
    clonedKoreanPageData.content.blocks[0].versions[0] = {
      availableFrom: 1583496180000,
      availableUntil: 9999999999999,
    };
    const koreanPageDataWithAvailableEpisode = clonedKoreanPageData;
    fetch.mockResponse(JSON.stringify(koreanPageDataWithAvailableEpisode));
    const { pageData } = await getInitialData('some-ondemand-radio-path');
    const { container } = await renderPage({
      pageData,
      service: 'korean',
      isAmp: true,
    });
    const audioPlayerIframeSrc = container
      .querySelector('amp-iframe')
      .getAttribute('src');

    expect(audioPlayerIframeSrc).toEqual(
      `https://polling.test.bbc.co.uk/ws/av-embeds/media/korean/bbc_korean_radio/w3ct0kn5/ko/amp?morph_env=live`,
    );
  });

  it('should show the audio player on AMP using no override on live', async () => {
    process.env.SIMORGH_APP_ENV = 'live';
    const clonedKoreanPageData = clone(koreanPageData);
    clonedKoreanPageData.content.blocks[0].versions[0] = {
      availableFrom: 1583496180000,
      availableUntil: 9999999999999,
    };
    const koreanPageDataWithAvailableEpisode = clonedKoreanPageData;
    fetch.mockResponse(JSON.stringify(koreanPageDataWithAvailableEpisode));
    const { pageData } = await getInitialData('some-ondemand-radio-path');
    const { container } = await renderPage({
      pageData,
      service: 'korean',
      isAmp: true,
    });
    const audioPlayerIframeSrc = container
      .querySelector('amp-iframe')
      .getAttribute('src');

    expect(audioPlayerIframeSrc).toEqual(
      'https://polling.bbc.co.uk/ws/av-embeds/media/korean/bbc_korean_radio/w3ct0kn5/ko/amp',
    );
  });

  it('should show the expired content message if episode is expired', async () => {
    const clonedKoreanPageData = clone(koreanPageData);
    clonedKoreanPageData.content.blocks[0].versions = [];
    const koreanPageDataWithExpiredEpisode = clonedKoreanPageData;
    fetch.mockResponse(JSON.stringify(koreanPageDataWithExpiredEpisode));
    const { pageData } = await getInitialData('some-ondemand-radio-path');
    const { container, getByText } = await renderPage({
      pageData,
      service: 'korean',
    });
    const audioPlayerIframeEl = container.querySelector('iframe');
    const expiredMessageEl = getByText('더 이상 이용할 수 없는 콘텐츠입니다.');

    expect(audioPlayerIframeEl).not.toBeInTheDocument();
    expect(expiredMessageEl).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should not show the audio player if it is not available yet', async () => {
    const clonedKoreanPageData = clone(koreanPageData);
    clonedKoreanPageData.content.blocks[0].versions[0] = {
      availableFrom: 9999999999999,
      availableUntil: 9999999999999,
    };
    const koreanPageDataWithNotYetAvailableEpisode = clonedKoreanPageData;
    fetch.mockResponse(
      JSON.stringify(koreanPageDataWithNotYetAvailableEpisode),
    );
    const { pageData } = await getInitialData('some-ondemand-radio-path');
    const { container } = await renderPage({ pageData, service: 'korean' });
    const audioPlayerIframeEl = container.querySelector('iframe');

    expect(audioPlayerIframeEl).not.toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
