using CoinbasePro;
using CoinbasePro.Shared.Types;
using CoinbasePro.WebSocket.Models.Response;
using CoinbasePro.WebSocket.Types;
using CoinbaseTelemetryMonitor.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CoinbaseTelemetryMonitor.Services
{
    public class CoinbaseWebSocketService : IHostedService
    {
        public CoinbaseProClient Client { get; private set; }
        public List<ProductType> ProductTypes { get; private set; }
        public List<ChannelType> ChannelTypes { get; private set; }
        private Timer connectionCheckTimer;
        private IHubContext<TickerHub> _hubContext;

        public CoinbaseWebSocketService(IHubContext<TickerHub> hubContext)
        {
            _hubContext = hubContext;
            //create the CoinbasePro client without an authenticator
            Client = new CoinbaseProClient();

            //use the websocket feed
            ProductTypes = new List<ProductType>() { ProductType.BtcUsd };
            ChannelTypes = new List<ChannelType>() { ChannelType.Ticker };

            connectionCheckTimer = new Timer(
            callback: new TimerCallback(CheckConnection),
            state: null,
            dueTime: 3000,
            period: 3000);

            // EventHandler for the heartbeat response type
            Client.WebSocket.OnTickerReceived += WebSocket_OnTickerReceived;
        }

        private void CheckConnection(object timerState)
        {
            if (Client.WebSocket.State == WebSocket4Net.WebSocketState.Closed)
            {
                Client.WebSocket.Start(ProductTypes, ChannelTypes);
            }
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            Client.WebSocket.Start(ProductTypes, ChannelTypes);
            return Task.CompletedTask;
        }

        private void WebSocket_OnTickerReceived(object sender, WebfeedEventArgs<Ticker> e)
        {
            BroadcastPriceUpdate(e.LastOrder.Price);
            Console.WriteLine(e);
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            Client.WebSocket.Stop();
            return Task.CompletedTask;
        }

        private async void BroadcastPriceUpdate(decimal price)
        {
            await _hubContext.Clients.All.SendAsync("PriceUpdate", price);
        }
    }
}
