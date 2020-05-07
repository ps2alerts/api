<?php

use GuzzleHttp\Client;

class AlertControllerTest extends \PHPUnit_Framework_TestCase
{
    public function testAlertReturnsCorrectNonEmptyHttpCode()
    {
        $client = new Client();
        $response = $client->request('GET', 'http://192.168.33.10/ps2alerts-api/public/v2/alerts/10000');

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testAlertHandlesEmptyData()
    {
        $client = new Client();
        $response = $client->request(
            'GET',
            'http://192.168.33.10/ps2alerts-api/public/v2/alerts/1',
            ['http_errors' => false]
        );

        $this->assertEquals(404, $response->getStatusCode());
        $this->assertTrue($response->hasHeader('Content-Type'));
        $data = json_decode($response->getBody(true), true);

        $this->assertArrayHasKey('error', $data);
        $this->assertArrayHasKey('code', $data['error']);
        $this->assertArrayHasKey('http_code', $data['error']);
        $this->assertArrayHasKey('message', $data['error']);
    }

    public function testAlertReturnsBody()
    {
        $client = new Client();
        $response = $client->request('GET', 'http://192.168.33.10/ps2alerts-api/public/v2/alerts/10000');

        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getBody(true), true);

        $this->assertArrayHasKey('data', $data);
    }

    public function testAlertReturnsJsonHeaders()
    {
        $client = new Client();
        $response = $client->request('GET', 'http://192.168.33.10/ps2alerts-api/public/v2/alerts/10000');

        $this->assertTrue($response->hasHeader('Content-Type'));
        $this->assertEquals('application/json', $response->getHeader('Content-Type')[0]);
    }

    public function testAlertReturnsAnyData()
    {
        $client = new Client();
        $response = $client->request('GET', 'http://192.168.33.10/ps2alerts-api/public/v2/alerts/10000');

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertTrue($response->hasHeader('Content-Type'));
        $data = json_decode($response->getBody(true), true);
        $this->assertArrayHasKey('data', $data);
        $this->assertArrayHasKey('id', $data['data']);
    }

    public function testAlertReturnsExpectedData()
    {
        $client = new Client();
        $response = $client->request('GET', 'http://192.168.33.10/ps2alerts-api/public/v2/alerts/10000');

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertTrue($response->hasHeader('Content-Type'));
        $data = json_decode($response->getBody(true), true);

        $this->assertArrayHasKey('data', $data);
        $this->assertArrayHasKey('id', $data['data']);
        $this->assertArrayHasKey('started', $data['data']);
        $this->assertArrayHasKey('ended', $data['data']);
        $this->assertArrayHasKey('server', $data['data']);
        $this->assertArrayHasKey('zone', $data['data']);
        $this->assertArrayHasKey('winner', $data['data']);
        $this->assertArrayHasKey('isDraw', $data['data']);
        $this->assertArrayHasKey('isDomination', $data['data']);
        $this->assertArrayHasKey('isValid', $data['data']);
        $this->assertArrayHasKey('inProgress', $data['data']);
    }
}
